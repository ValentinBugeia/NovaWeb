'use strict';

const STEPS = [
  'Devis envoyé',
  'Acompte reçu',
  'Design validé',
  'Développement',
  'Mise en ligne'
];

const STATUS_MAP = {
  'pending':     { label: 'En attente',  cls: 'status-pending'   },
  'in-progress': { label: 'En cours',    cls: 'status-progress'  },
  'review':      { label: 'En révision', cls: 'status-review'    },
  'delivered':   { label: 'Livré ✓',     cls: 'status-delivered' },
};

/* ── Auth guard ── */
auth.onAuthStateChanged(async user => {
  if (!user) { window.location.href = 'index.html'; return; }

  const userDoc = await db.collection('users').doc(user.uid).get();
  const prenom  = userDoc.exists ? userDoc.data().prenom : user.email.split('@')[0];
  document.getElementById('userGreeting').textContent = `Bonjour, ${prenom}`;

  loadOrders(user.email.toLowerCase());
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
  await auth.signOut();
  window.location.href = 'index.html';
});

/* ── Load orders ── */
function loadOrders(email) {
  const grid    = document.getElementById('ordersGrid');
  const loading = document.getElementById('ordersLoading');
  const empty   = document.getElementById('ordersEmpty');

  db.collection('orders')
    .where('clientEmail', '==', email)
    .orderBy('createdAt', 'desc')
    .onSnapshot(snapshot => {
      loading.classList.add('hidden');
      grid.querySelectorAll('.order-card').forEach(el => el.remove());

      if (snapshot.empty) {
        empty.classList.remove('hidden');
        return;
      }

      empty.classList.add('hidden');
      snapshot.forEach(doc => grid.appendChild(buildCard(doc.id, doc.data())));
    }, () => {
      loading.classList.add('hidden');
      empty.classList.remove('hidden');
    });
}

/* ── Build order card ── */
function buildCard(id, order) {
  const step     = Math.min(Math.max(order.currentStep ?? 0, 0), STEPS.length);
  const pct      = Math.round((step / STEPS.length) * 100);
  const status   = STATUS_MAP[order.status] ?? STATUS_MAP['pending'];

  const stepsHtml = STEPS.map((label, i) => {
    const done   = i < step;
    const active = i === step;
    return `<div class="step ${done ? 'done' : ''} ${active ? 'active' : ''}">
      <div class="step-dot">${done ? '✓' : i + 1}</div>
      <span class="step-label">${label}</span>
    </div>`;
  }).join('');

  const date = order.createdAt?.toDate
    ? order.createdAt.toDate().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
    : '—';

  const card = document.createElement('div');
  card.className = 'order-card';
  card.innerHTML = `
    <div class="order-card__header">
      <div>
        <span class="font-mono c-blue order-type">${order.type || 'Site Web'}</span>
        <h2 class="order-title">${order.title || 'Projet en cours'}</h2>
      </div>
      <span class="order-status ${status.cls}">${status.label}</span>
    </div>
    <div class="order-progress-bar">
      <div class="order-progress-fill" style="width:${pct}%"></div>
    </div>
    <span class="font-mono order-pct" style="display:block;margin-bottom:0">${pct}% complété</span>
    <div class="order-steps">${stepsHtml}</div>
    <div class="order-meta">
      <span>Projet créé le ${date}</span>
      ${order.notes ? `<p class="order-notes" style="margin-top:.6rem">${order.notes}</p>` : ''}
    </div>
  `;
  return card;
}
