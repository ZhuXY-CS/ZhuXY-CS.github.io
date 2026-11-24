const recordView = `
  INSERT INTO country_views (country, views) VALUES (?1, 1)
  ON CONFLICT (country) DO UPDATE SET views = views + 1
`;

export default {
  async fetch(request, env) {
    const {pathname} = new URL(request.url);
    const headers = {
      'Access-Control-Allow-Origin': env.SITE_ORIGIN,
      'Cache-Control': 'no-store'
    };

    if (pathname === '/view' && request.method === 'POST') {
      if (request.headers.get('Origin') !== env.SITE_ORIGIN) {
        return new Response(null, {status: 403, headers});
      }

      const country = request.cf?.country;
      const privateMode = request.headers.get('Sec-GPC') === '1' || request.headers.get('DNT') === '1';
      if (!country || !/^[A-Z]{2}$/.test(country) || country === 'XX' ||
          privateMode || request.cf?.botManagement?.verifiedBot) {
        return new Response(null, {status: 204, headers});
      }

      await env.VISITS.prepare(recordView).bind(country).run();
      return new Response(null, {status: 204, headers});
    }

    if (pathname === '/countries' && request.method === 'GET') {
      const {results} = await env.VISITS.prepare(
        'SELECT country, views FROM country_views ORDER BY views DESC, country'
      ).all();
      return Response.json(results, {
        headers: {...headers, 'Cache-Control': 'public, max-age=120'}
      });
    }

    return new Response(null, {status: 404, headers});
  }
};
