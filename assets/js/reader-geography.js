(() => {
  const panel = document.getElementById('reader-geography');
  const canvas = panel.querySelector('canvas');
  const status = panel.querySelector('[role="status"]');
  const ranking = panel.querySelector('ol');
  const expand = panel.querySelector('.reader-geography-expand');
  const dialog = panel.querySelector('dialog');
  const viewport = dialog.querySelector('.reader-geography-viewport');
  const enlarged = viewport.querySelector('canvas');
  const stage = dialog.querySelector('.reader-geography-stage');
  const tooltip = stage.querySelector('.reader-geography-tooltip');
  const tooltipName = tooltip.querySelector('strong');
  const tooltipCount = tooltip.querySelector('span');
  const zoomControls = dialog.querySelector('.reader-geography-zoom');
  const zoomOut = zoomControls.querySelector('[data-zoom="out"]');
  const zoomIn = zoomControls.querySelector('[data-zoom="in"]');
  const zoomReset = zoomControls.querySelector('[data-zoom="reset"]');
  const zoomLevel = zoomControls.querySelector('output');
  let zoom = 1;
  let map;
  let drag;
  let enlargedDrawing;
  let activeRegion;
  const endpoint = panel.dataset.endpoint;
  const names = typeof Intl.DisplayNames === 'function'
    ? new Intl.DisplayNames('en', {type: 'region'})
    : {of: code => code};
  const format = new Intl.NumberFormat('en');

  const fetchJson = async url => {
    const response = await fetch(url, {credentials: 'omit', referrerPolicy: 'no-referrer'});
    if (!response.ok) throw new Error('Reader geography request failed');
    return response.json();
  };

  const privateMode = navigator.globalPrivacyControl === true || navigator.doNotTrack === '1';
  let recording;
  const record = () => {
    if (!privateMode && !recording && document.visibilityState === 'visible') {
      recording = fetch(endpoint + '/view', {
        method: 'POST', credentials: 'omit', referrerPolicy: 'no-referrer', keepalive: true
      }).catch(() => {});
    }
  };
  record();
  document.addEventListener('visibilitychange', record);

  // Spherical Equal Earth projection by Šavrič, Patterson, and Jenny (2018).
  function equalEarth(longitude, latitude) {
    const radians = Math.PI / 180;
    const halfRoot = Math.sqrt(3) / 2;
    const angle = Math.asin(halfRoot * Math.sin(latitude * radians));
    const square = angle * angle;
    const sixth = square * square * square;
    const x = longitude * radians * Math.cos(angle) /
      (halfRoot * (1.340264 - 0.243318 * square + sixth * (0.006251 + 0.034164 * square)));
    const y = angle * (1.340264 - 0.081106 * square + sixth * (0.000893 + 0.003796 * square));
    return [x, y];
  }

  const palette = ['#a5bfd9', '#a9c8a9', '#deb6a3', '#e0cd91', '#c4b8d5', '#9fc6c8'];
  const markerColor = '#213e57';
  const inset = 0.012;

  function prepareOutlines(outlines) {
    let west = Infinity, east = -Infinity, south = Infinity, north = -Infinity;
    const projected = outlines.map(([code, polygons, position, color]) => [
      code,
      polygons.map(polygon => polygon.map(ring => ring.map(([lon, lat]) => {
        const [x, y] = equalEarth(lon, lat);
        west = Math.min(west, x);
        east = Math.max(east, x);
        south = Math.min(south, y);
        north = Math.max(north, y);
        return [x, y];
      }))),
      position && equalEarth(...position),
      color
    ]);
    const ratio = 1 / ((north - south) / (east - west) * (1 - 2 * inset) + 2 * inset);
    return {projected, west, east, north, ratio};
  }

  function drawMap(surface) {
    const width = Math.min(4096, Math.round(surface.clientWidth * (window.devicePixelRatio || 1)));
    if (!width || !map) return;
    const height = Math.round(width / map.ratio);
    surface.width = width;
    surface.height = height;
    const context = surface.getContext('2d');
    if (!context) return;
    const margin = width * inset;
    const scale = (width - 2 * margin) / (map.east - map.west);
    const project = ([x, y]) => [margin + (x - map.west) * scale, margin + (map.north - y) * scale];
    const regions = [];
    const marks = [];
    const pixelScale = width / surface.clientWidth;

    for (const [code, polygons, position, color] of map.projected) {
      if (position && map.visits.has(code)) {
        const [x, y] = project(position);
        marks.push({code, x, y});
      }
      if (!polygons.length) continue;

      const path = new Path2D();
      let left = Infinity, right = -Infinity, top = Infinity, bottom = -Infinity;
      for (const polygon of polygons) {
        for (const ring of polygon) {
          ring.forEach((point, i) => {
            const [x, y] = project(point);
            left = Math.min(left, x);
            right = Math.max(right, x);
            top = Math.min(top, y);
            bottom = Math.max(bottom, y);
            if (i === 0) path.moveTo(x, y);
            else path.lineTo(x, y);
          });
          path.closePath();
        }
      }
      regions.push({code, path, left, right, top, bottom, color});
    }

    const drawing = {context, width, height, regions, marks, pixelScale};
    if (surface === enlarged) enlargedDrawing = drawing;
    paintMap(drawing, surface === enlarged);
  }

  function paintMap(drawing, interactive) {
    const {context, width, height, regions, marks, pixelScale} = drawing;
    context.clearRect(0, 0, width, height);
    context.lineWidth = pixelScale * 0.85;
    context.strokeStyle = '#f8fbfd';
    for (const region of regions) {
      context.fillStyle = palette[region.color] ?? '#c4ccd3';
      context.fill(region.path, 'evenodd');
      context.stroke(region.path);
    }
    const active = interactive && activeRegion && regions.find(region => region.code === activeRegion);
    if (active) {
      context.fillStyle = 'rgba(33, 62, 87, 0.15)';
      context.strokeStyle = markerColor;
      context.lineWidth = 1.2 * pixelScale;
      context.fill(active.path, 'evenodd');
      context.stroke(active.path);
    }

    const radius = 4 * pixelScale;
    for (const {code, x, y} of marks) {
      context.fillStyle = markerColor;
      context.strokeStyle = '#fff';
      context.lineWidth = 2 * pixelScale;
      context.beginPath();
      context.arc(x, y, radius, 0, 2 * Math.PI);
      context.fill();
      context.stroke();

      if (marks.length === 1) {
        const label = `${names.of(code)} · ${format.format(map.visits.get(code))}`;
        const gap = radius + 5 * pixelScale;
        context.font = `600 ${12 * pixelScale}px "Trebuchet MS", sans-serif`;
        context.textBaseline = 'middle';
        const labelWidth = context.measureText(label).width;
        context.textAlign = x + gap + labelWidth < width - gap ? 'left' : 'right';
        const labelX = context.textAlign === 'left' ? x + gap : x - gap;
        context.strokeText(label, labelX, y);
        context.fillText(label, labelX, y);
      }
    }
  }

  function clearInspection() {
    tooltip.hidden = true;
    if (!activeRegion) return;
    activeRegion = undefined;
    if (dialog.open && enlargedDrawing) paintMap(enlargedDrawing, true);
  }

  function inspectMap(event) {
    if (drag || !enlargedDrawing) return;
    const {context, width, height, regions, marks, pixelScale} = enlargedDrawing;
    const canvasBox = enlarged.getBoundingClientRect();
    const x = (event.clientX - canvasBox.left) * width / canvasBox.width;
    const y = (event.clientY - canvasBox.top) * height / canvasBox.height;
    const hit = marks.find(mark => Math.hypot(mark.x - x, mark.y - y) <= 9 * pixelScale) ??
      regions.find(region => region.code && x >= region.left && x <= region.right &&
        y >= region.top && y <= region.bottom && context.isPointInPath(region.path, x, y, 'evenodd'));
    if (!hit) {
      clearInspection();
      return;
    }

    if (hit.code !== activeRegion) {
      activeRegion = hit.code;
      paintMap(enlargedDrawing, true);
      tooltipName.textContent = names.of(hit.code);
      const visits = map.visits.get(hit.code) ?? 0;
      tooltipCount.textContent = map.hasSummary
        ? `${format.format(visits)} ${visits === 1 ? 'visit' : 'visits'} recorded`
        : 'Visit total unavailable';
    }

    tooltip.hidden = false;
    const stageBox = stage.getBoundingClientRect();
    const edge = 8;
    const offset = 14;
    const left = event.clientX - stageBox.left + offset;
    const below = event.clientY - stageBox.top + offset;
    const top = below + tooltip.offsetHeight < stageBox.height - edge
      ? below : below - tooltip.offsetHeight - offset * 2;
    tooltip.style.left = `${Math.max(edge, Math.min(stageBox.width - tooltip.offsetWidth - edge, left))}px`;
    tooltip.style.top = `${Math.max(edge, top)}px`;
  }

  enlarged.addEventListener('pointermove', event => {
    if (event.pointerType !== 'touch') inspectMap(event);
  });
  enlarged.addEventListener('click', inspectMap);
  enlarged.addEventListener('pointerleave', event => {
    if (event.pointerType !== 'touch') clearInspection();
  });
  viewport.addEventListener('scroll', clearInspection, {passive: true});

  function setZoom(next) {
    clearInspection();
    const positionX = (viewport.scrollLeft + viewport.clientWidth / 2) / enlarged.clientWidth;
    const positionY = (viewport.scrollTop + viewport.clientHeight / 2) / enlarged.clientHeight;
    zoom = Math.max(1, Math.min(4, next));
    enlarged.style.width = `${zoom * 100}%`;
    drawMap(enlarged);
    viewport.scrollLeft = positionX * enlarged.clientWidth - viewport.clientWidth / 2;
    viewport.scrollTop = positionY * enlarged.clientHeight - viewport.clientHeight / 2;
    zoomLevel.value = `${zoom * 100}%`;
    zoomOut.disabled = zoom === 1;
    zoomReset.disabled = zoom === 1;
    zoomIn.disabled = zoom === 4;
    viewport.toggleAttribute('data-zoomed', zoom > 1);
  }

  function resizeMaps() {
    drawMap(canvas);
    if (dialog.open) {
      clearInspection();
      drawMap(enlarged);
    }
  }

  expand.addEventListener('click', () => {
    dialog.showModal();
    enlarged.style.width = '100%';
    setZoom(1);
  });
  dialog.addEventListener('close', () => {
    clearInspection();
    enlargedDrawing = undefined;
    expand.focus();
  });
  zoomOut.addEventListener('click', () => setZoom(zoom - 0.5));
  zoomIn.addEventListener('click', () => setZoom(zoom + 0.5));
  zoomReset.addEventListener('click', () => setZoom(1));
  dialog.addEventListener('keydown', event => {
    const next = {'+': zoom + 0.5, '=': zoom + 0.5, '-': zoom - 0.5, '0': 1}[event.key];
    if (next === undefined || event.ctrlKey || event.metaKey || event.altKey) return;
    event.preventDefault();
    setZoom(next);
  });

  viewport.addEventListener('pointerdown', event => {
    if (zoom === 1 || event.pointerType !== 'mouse' || event.button !== 0) return;
    clearInspection();
    drag = {
      id: event.pointerId, x: event.clientX, y: event.clientY,
      left: viewport.scrollLeft, top: viewport.scrollTop
    };
    viewport.setPointerCapture(event.pointerId);
    viewport.toggleAttribute('data-dragging', true);
  });
  viewport.addEventListener('pointermove', event => {
    if (event.pointerId !== drag?.id) return;
    viewport.scrollLeft = drag.left + drag.x - event.clientX;
    viewport.scrollTop = drag.top + drag.y - event.clientY;
  });
  viewport.addEventListener('lostpointercapture', () => {
    drag = undefined;
    viewport.removeAttribute('data-dragging');
  });


  async function showGeography() {
    const geography = fetchJson(panel.dataset.map);
    const counts = Promise.resolve(recording).then(() => fetchJson(endpoint + '/countries'));
    const [outlines, summary] = await Promise.allSettled([geography, counts]);

    const entries = summary.status === 'fulfilled' ? summary.value : [];
    const visits = new Map(entries.map(({country, views}) => [country, views]));
    if (outlines.status === 'fulfilled') {
      map = {...prepareOutlines(outlines.value), visits, hasSummary: summary.status === 'fulfilled'};
      panel.style.setProperty('--map-ratio', map.ratio);
      resizeMaps();
      window.addEventListener('resize', resizeMaps, {passive: true});
      expand.hidden = typeof dialog.showModal !== 'function';
    } else {
      canvas.hidden = true;
    }

    if (summary.status !== 'fulfilled') {
      status.textContent = 'Visit totals are currently unavailable.';
      return;
    }
    if (!entries.length) {
      status.textContent = 'No country-level visits recorded yet.';
      return;
    }

    const total = entries.reduce((sum, {views}) => sum + views, 0);
    const places = entries.length;
    const totalLabel = document.createElement('strong');
    totalLabel.textContent = format.format(total);
    const placeLabel = document.createElement('strong');
    placeLabel.textContent = format.format(places);
    status.replaceChildren(
      totalLabel, total === 1 ? ' visit · ' : ' visits · ',
      placeLabel, places === 1 ? ' country or region' : ' countries and regions'
    );
    entries.slice(0, 5).forEach(({country, views}) => {
      const row = document.createElement('li');
      const name = document.createElement('span');
      const count = document.createElement('span');
      name.textContent = names.of(country);
      count.textContent = format.format(views);
      row.append(name, ' · ', count);
      ranking.append(row);
    });
    ranking.hidden = false;
  }

  if ('IntersectionObserver' in window) {
    const nearMap = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        nearMap.disconnect();
        showGeography();
      }
    }, {rootMargin: '240px'});
    nearMap.observe(panel);
  } else {
    showGeography();
  }
})();
