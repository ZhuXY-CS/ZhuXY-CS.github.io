(() => {
  const panel = document.getElementById('reader-geography');
  const canvas = panel.querySelector('canvas');
  const status = panel.querySelector('[role="status"]');
  const ranking = panel.querySelector('ol');
  const expand = panel.querySelector('.reader-geography-expand');
  const dialog = panel.querySelector('dialog');
  const viewport = dialog.querySelector('.reader-geography-viewport');
  const enlarged = viewport.querySelector('canvas');
  const zoomControls = dialog.querySelector('.reader-geography-zoom');
  const zoomOut = zoomControls.querySelector('[data-zoom="out"]');
  const zoomIn = zoomControls.querySelector('[data-zoom="in"]');
  const zoomReset = zoomControls.querySelector('[data-zoom="reset"]');
  const zoomLevel = zoomControls.querySelector('output');
  let zoom = 1;
  let map;
  let drag;
  const endpoint = panel.dataset.endpoint;

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

  function drawMap(surface) {
    const width = Math.min(4096, Math.round(surface.clientWidth * (window.devicePixelRatio || 1)));
    if (!width || !map) return;
    surface.width = width;
    surface.height = Math.round(width * 580 / 1440);
    const context = surface.getContext('2d');
    if (!context) return;
    const margin = width / 62;
    const mapWidth = width - margin * 2;
    const mapHeight = surface.height - margin * 2;
    context.lineWidth = Math.max(0.65, width / 950);
    context.strokeStyle = '#f6f9fc';

    for (const [code, polygons] of map.outlines) {
      context.fillStyle = map.visits.has(code) ? '#467ba4' : '#dce6ef';
      for (const polygon of polygons) {
        context.beginPath();
        for (const ring of polygon) {
          ring.forEach(([longitude, latitude], i) => {
            const x = margin + (longitude + 180) * mapWidth / 360;
            const y = margin + (85 - latitude) * mapHeight / 145;
            if (i === 0) context.moveTo(x, y);
            else context.lineTo(x, y);
          });
          context.closePath();
        }
        context.fill('evenodd');
        context.stroke();
      }
    }
  }

  function setZoom(next) {
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
    if (dialog.open) drawMap(enlarged);
  }

  expand.addEventListener('click', () => {
    dialog.showModal();
    enlarged.style.width = '100%';
    setZoom(1);
  });
  dialog.addEventListener('close', () => expand.focus());
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
      map = {outlines: outlines.value, visits};
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

    const names = new Intl.DisplayNames('en', {type: 'region'});
    const format = new Intl.NumberFormat('en');
    const total = entries.reduce((sum, {views}) => sum + views, 0);
    const places = entries.length;
    status.textContent = `${format.format(total)} ${total === 1 ? 'visit' : 'visits'} · ${format.format(places)} ${places === 1 ? 'country or region' : 'countries and regions'}`;
    entries.slice(0, 5).forEach(({country, views}) => {
      const row = document.createElement('li');
      const name = document.createElement('span');
      const count = document.createElement('span');
      name.textContent = names.of(country);
      count.textContent = format.format(views);
      row.append(name, count);
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
