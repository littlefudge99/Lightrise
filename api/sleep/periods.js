export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'Missing authorization header' });
  }

  const { start_date, end_date } = req.query;

  try {
    const response = await fetch(
      `https://api.ouraring.com/v2/usercollection/sleep?start_date=${start_date}&end_date=${end_date}`,
      { headers: { Authorization: token } }
    );
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
