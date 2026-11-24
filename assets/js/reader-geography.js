(() => {
  const panel = document.getElementById('reader-geography');
  const canvas = panel.querySelector('canvas');
  const status = panel.querySelector('[role="status"]');
  const ranking = panel.querySelector('ol');
  const context = canvas.getContext('2d');
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

  function drawMap(geography, visits) {
    if (!context) return;
    const margin = 24;
    const width = canvas.width - margin * 2;
    const height = canvas.height - margin * 2;
    context.lineWidth = 1.3;
    context.strokeStyle = '#f7f9fb';

    for (const [code, polygons] of geography) {
      context.fillStyle = visits.has(code) ? '#4c7da6' : '#d9e3ec';
      for (const polygon of polygons) {
        context.beginPath();
        for (const ring of polygon) {
          ring.forEach(([longitude, latitude], i) => {
            const x = margin + (longitude + 180) * width / 360;
            const y = margin + (85 - latitude) * height / 145;
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

  async function showGeography() {
    const geography = fetchJson(panel.dataset.map);
    const counts = Promise.resolve(recording).then(() => fetchJson(endpoint + '/countries'));
    const [outlines, summary] = await Promise.allSettled([geography, counts]);

    const entries = summary.status === 'fulfilled' ? summary.value : [];
    const visits = new Map(entries.map(({country, views}) => [country, views]));
    if (outlines.status === 'fulfilled') drawMap(outlines.value, visits);
    else canvas.hidden = true;

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
