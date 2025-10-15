export async function POST(req) {
  try {
    const body = await req.json();
    const { serverName, ram } = body || {};
    if (!serverName || !ram) return Response.json({ error: 'Missing serverName or ram' }, { status: 400 });

    const adminToken = req.headers.get('x-admin-token') || '';
    if (!process.env.ADMIN_TOKEN) {
      return Response.json({ error: 'Server not configured (ADMIN_TOKEN missing)' }, { status: 500 });
    }
    if (adminToken !== process.env.ADMIN_TOKEN) {
      return Response.json({ error: 'Unauthorized (invalid token)' }, { status: 401 });
    }

    const random = Math.random().toString(36).substring(7);
    const email = `${serverName.toLowerCase().replace(/\s+/g,'')}_${random}@generated.local`;
    const username = `${serverName.toLowerCase().replace(/\s+/g,'')}_${random}`;
    const password = Math.random().toString(36).slice(-10);

    const base = process.env.PTERO_DOMAIN;
    const apiKey = process.env.PTERO_API_KEY;
    if (!base || !apiKey) return Response.json({ error: 'Pterodactyl not configured' }, { status: 500 });

    // create user
    const userRes = await fetch(`${base}/api/application/users`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        email, username, first_name: serverName, last_name: 'User', password, root_admin: false
      })
    });

    const userJson = await userRes.json();
    if (userRes.status !== 201) {
      return Response.json({ error: userJson.errors?.[0]?.detail || 'Failed create user' }, { status: 500 });
    }

    const userId = userJson.attributes.id;

    // create server
    const serverRes = await fetch(`${base}/api/application/servers`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        name: serverName,
        user: userId,
        egg: parseInt(process.env.PTERO_EGG_ID || '1'),
        docker_image: 'ghcr.io/parkervcp/yolks:nodejs_18',
        startup: 'node index.js',
        environment: { CMD_RUN: 'node index.js' },
        limits: { memory: parseInt(ram), swap: 0, disk: parseInt(process.env.PTERO_DISK || '10240'), io: 500, cpu: parseInt(process.env.PTERO_CPU || '100') },
        feature_limits: { databases: 1, allocations: 1, backups: 1 },
        deploy: { locations: [parseInt(process.env.PTERO_LOCATION_ID || '1')], dedicated_ip: false, port_range: [] }
      })
    });

    const serverJson = await serverRes.json();
    if (serverRes.status !== 201) {
      return Response.json({ error: serverJson.errors?.[0]?.detail || 'Failed create server' }, { status: 500 });
    }

    return Response.json({ success: true, email, username, password, server: serverJson.attributes });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
