(() => {
  const panel = document.getElementById('reader-geography');
  const status = panel.querySelector('[role="status"]');
  const expand = panel.querySelector('.reader-geography-expand');
  const dialog = panel.querySelector('dialog');
  const viewport = dialog.querySelector('.reader-geography-viewport');
  const overview = bindMap(panel.querySelector('.reader-geography-card .reader-geography-stage'));
  const detail = bindMap(dialog.querySelector('.reader-geography-stage'));
  const enlarged = detail.canvas;
  const zoomControls = dialog.querySelector('.reader-geography-zoom');
  const zoomOut = zoomControls.querySelector('[data-zoom="out"]');
  const zoomIn = zoomControls.querySelector('[data-zoom="in"]');
  const zoomReset = zoomControls.querySelector('[data-zoom="reset"]');
  const zoomLevel = zoomControls.querySelector('output');
  let zoom = 1;
  let map;
  let drag;
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

  const palette = ['#a5bfd9', '#a9c8a9', '#deb6a3', '#e0cd91', '#c4b8d5', '#9fc6c8'];
  const markerColor = '#213e57';
  const inset = 0.012;

  function measureOutlines(outlines) {
    let west = Infinity, east = -Infinity, south = Infinity, north = -Infinity;
    for (const [, polygons] of outlines) {
      for (const polygon of polygons) {
        for (const ring of polygon) {
          for (const [longitude, latitude] of ring) {
            west = Math.min(west, longitude);
            east = Math.max(east, longitude);
            south = Math.min(south, latitude);
            north = Math.max(north, latitude);
          }
        }
      }
    }
    const ratio = 1 / ((north - south) / (east - west) * (1 - 2 * inset) + 2 * inset);
    return {west, east, north, ratio};
  }

  function bindMap(stage) {
    const canvas = stage.querySelector('canvas');
    const tooltip = stage.querySelector('.reader-geography-tooltip');
    const view = {
      stage, canvas, tooltip,
      tooltipName: tooltip.querySelector('strong'),
      tooltipCount: tooltip.querySelector('span')
    };
    canvas.addEventListener('pointermove', event => {
      if (event.pointerType !== 'touch') inspectMap(event, view);
    });
    canvas.addEventListener('click', event => inspectMap(event, view));
    canvas.addEventListener('pointerleave', event => {
      if (event.pointerType !== 'touch') clearInspection(view);
    });
    return view;
  }

  function drawMap(view) {
    const surface = view.canvas;
    const width = Math.min(4096, Math.round(surface.clientWidth * (window.devicePixelRatio || 1)));
    if (!width || !map) return;
    const height = Math.round(width / map.ratio);
    surface.width = width;
    surface.height = height;
    const context = surface.getContext('2d');
    if (!context) return;
    const margin = width * inset;
    const scale = (width - 2 * margin) / (map.east - map.west);
    // Equirectangular projection keeps the meridians vertical at every latitude.
    const project = ([longitude, latitude]) => [
      margin + (longitude - map.west) * scale,
      margin + (map.north - latitude) * scale
    ];
    const regions = [];
    const marks = [];
    const pixelScale = width / surface.clientWidth;

    for (const [code, polygons, position, color] of map.outlines) {
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

    view.drawing = {context, width, height, regions, marks, pixelScale};
    paintMap(view);
  }

  function paintMap({drawing, activeRegion}) {
    const {context, width, height, regions, marks, pixelScale} = drawing;
    context.clearRect(0, 0, width, height);
    context.lineWidth = pixelScale * 0.85;
    context.strokeStyle = '#f8fbfd';
    for (const region of regions) {
      context.fillStyle = palette[region.color] ?? '#c4ccd3';
      context.fill(region.path, 'evenodd');
      context.stroke(region.path);
    }
    const active = activeRegion && regions.find(region => region.code === activeRegion);
    if (active) {
      context.fillStyle = 'rgba(33, 62, 87, 0.15)';
      context.strokeStyle = markerColor;
      context.lineWidth = 1.2 * pixelScale;
      context.fill(active.path, 'evenodd');
      context.stroke(active.path);
    }

    for (const {code, x, y} of marks) {
      const radius = (code === activeRegion ? 6 : 4) * pixelScale;
      context.fillStyle = markerColor;
      context.strokeStyle = '#fff';
      context.lineWidth = 2 * pixelScale;
      context.beginPath();
      context.arc(x, y, radius, 0, 2 * Math.PI);
      context.fill();
      context.stroke();
    }
  }

  function clearInspection(view) {
    view.tooltip.hidden = true;
    if (!view.activeRegion) return;
    view.activeRegion = undefined;
    paintMap(view);
  }

  function inspectMap(event, view) {
    if (drag || !view.drawing) return;
    const {canvas, drawing, stage, tooltip, tooltipName, tooltipCount} = view;
    const {context, width, height, regions, marks, pixelScale} = drawing;
    const canvasBox = canvas.getBoundingClientRect();
    const x = (event.clientX - canvasBox.left) * width / canvasBox.width;
    const y = (event.clientY - canvasBox.top) * height / canvasBox.height;
    const hit = marks.find(mark => Math.hypot(mark.x - x, mark.y - y) <= 9 * pixelScale) ??
      regions.find(region => region.code && x >= region.left && x <= region.right &&
        y >= region.top && y <= region.bottom && context.isPointInPath(region.path, x, y, 'evenodd'));
    if (!hit) {
      clearInspection(view);
      return;
    }

    if (hit.code !== view.activeRegion) {
      view.activeRegion = hit.code;
      paintMap(view);
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

  viewport.addEventListener('scroll', () => clearInspection(detail), {passive: true});

  function setZoom(next) {
    clearInspection(detail);
    const positionX = (viewport.scrollLeft + viewport.clientWidth / 2) / enlarged.clientWidth;
    const positionY = (viewport.scrollTop + viewport.clientHeight / 2) / enlarged.clientHeight;
    zoom = Math.max(1, Math.min(4, next));
    enlarged.style.width = `${zoom * 100}%`;
    drawMap(detail);
    viewport.scrollLeft = positionX * enlarged.clientWidth - viewport.clientWidth / 2;
    viewport.scrollTop = positionY * enlarged.clientHeight - viewport.clientHeight / 2;
    zoomLevel.value = `${zoom * 100}%`;
    zoomOut.disabled = zoom === 1;
    zoomReset.disabled = zoom === 1;
    zoomIn.disabled = zoom === 4;
    viewport.toggleAttribute('data-zoomed', zoom > 1);
  }

  function resizeMaps() {
    clearInspection(overview);
    drawMap(overview);
    if (dialog.open) {
      clearInspection(detail);
      drawMap(detail);
    }
  }

  expand.addEventListener('click', () => {
    clearInspection(overview);
    dialog.showModal();
    enlarged.style.width = '100%';
    setZoom(1);
  });
  dialog.addEventListener('close', () => {
    clearInspection(detail);
    detail.drawing = undefined;
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
    clearInspection(detail);
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
      map = {
        ...measureOutlines(outlines.value),
        outlines: outlines.value,
        visits,
        hasSummary: summary.status === 'fulfilled'
      };
      panel.style.setProperty('--map-ratio', map.ratio);
      resizeMaps();
      window.addEventListener('resize', resizeMaps, {passive: true});
      expand.hidden = typeof dialog.showModal !== 'function';
    } else {
      overview.canvas.hidden = true;
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
    const totalLabel = document.createElement('strong');
    totalLabel.textContent = format.format(total);
    status.replaceChildren(totalLabel, total === 1 ? ' visit' : ' visits');
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
