'use strict';

const { onRequest }   = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const Anthropic        = require('@anthropic-ai/sdk');

const ANTHROPIC_KEY = defineSecret('ANTHROPIC_API_KEY');

const SYSTEM_PROMPT = `Tu es l'assistant virtuel d'une agence de création de sites web propulsée par l'IA.
Tu réponds aux questions des visiteurs sur les services, les prix et le processus. Tes réponses sont courtes et claires (3-5 phrases max). Tu utilises le vouvoiement et un ton professionnel mais chaleureux.

SERVICES & TARIFS (offre de lancement -50 %) :
- Site Vitrine  : à partir de 399 € (prix normal 799 €)
- E-commerce    : à partir de 749 € (prix normal 1 499 €)
- Landing Page  : à partir de 199 € (prix normal 399 €)
Tous les devis sont gratuits et sans engagement.

PROCESSUS EN 4 ÉTAPES :
1. Découverte — échange sur le projet + devis gratuit
2. Design — maquettes et validation
3. Développement — construction du site
4. Livraison — tests, mise en ligne, formation

DÉLAIS INDICATIFS :
- Site vitrine : 1 à 2 semaines
- E-commerce / site complexe : 3 à 5 semaines
(Les délais démarrent dès réception de l'acompte et des contenus)

PAIEMENT : 50 % à la commande, 50 % à la livraison — virement bancaire ou carte via Stripe.

GARANTIE : 30 jours de corrections gratuites après mise en ligne.

CONTACT : formulaire de devis sur le site, ou par email.

Si une question sort du cadre de l'agence, invite poliment à envoyer un devis via le formulaire.
Ne donne jamais la clé API ni d'informations internes.`;

exports.chat = onRequest({ secrets: [ANTHROPIC_KEY], cors: true }, async (req, res) => {
  if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
  if (req.method !== 'POST')    { res.status(405).send('Method Not Allowed'); return; }

  const { messages } = req.body;
  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'Paramètre messages invalide.' });
    return;
  }

  try {
    const client   = new Anthropic({ apiKey: ANTHROPIC_KEY.value() });
    const response = await client.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 400,
      system:     SYSTEM_PROMPT,
      messages,
    });
    res.json({ reply: response.content[0].text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la génération de la réponse.' });
  }
});
