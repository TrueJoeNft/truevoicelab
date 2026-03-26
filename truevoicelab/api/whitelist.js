export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, name, lang, followed_twitter, source } = req.body;

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
          NOMBRE: name || '',
          TWITTER_FOLLOW: followed_twitter ? 'yes' : 'no',
          SOURCE: source || 'truevoicelab.com',
          LANG: lang || 'en'
        }
      })
    });

    if (response.status === 201 || response.status === 204) {
      return res.status(200).json({ success: true });
    }

    const data = await response.json();

    if (data.code === 'duplicate_parameter') {
      return res.status(200).json({ success: true, duplicate: true });
    }

    return res.status(500).json({ error: 'Brevo error', detail: data });

  } catch (err) {
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
}
