export default async function handler(req, res) {
  // Solo aceptar POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, wallet, lang } = req.body;

  // Validar email
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY
      },
      body: JSON.stringify({
        email: email,
        listIds: [3],
        updateEnabled: true,
        attributes: {
          WALLET: wallet || '',
          LANG: lang || 'en',
          SOURCE: 'truevoicelab.com whitelist'
        }
      })
    });

    if (response.status === 201 || response.status === 204) {
      return res.status(200).json({ success: true });
    }

    const data = await response.json();

    // Contact already exists — still a success for the