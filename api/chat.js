export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    return res.status(200).end()
  }

  if (req.method !== 'POST') return res.status(405).end()

  res.setHeader('Access-Control-Allow-Origin', '*')

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        system: `Tu es l'assistant support de FidèleApp, une application de programme de fidélité pour commerçants français. Tu réponds uniquement en français, de façon concise et bienveillante en 2-3 phrases maximum. Tu analyses le problème de l'utilisateur et tu essaies de comprendre la cause racine avant de proposer une solution concrète. Tu aides avec : le tableau de bord, encaisser des achats, gérer les clients, configurer les points et récompenses, les QR codes. Si tu ne sais pas, suggère support@fidele-app.fr`,
        messages: req.body.messages,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Anthropic error:', err)
      return res.status(500).json({ error: err })
    }

    const data = await response.json()
    res.status(200).json(data)
  } catch (e) {
    console.error('Handler error:', e)
    res.status(500).json({ error: e.message })
  }
}
