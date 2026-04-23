'use strict';

// ─── Changez par votre email admin ────────────────────────────
const ADMIN_EMAIL = 'valentin.bugeia@gmail.com';
// ──────────────────────────────────────────────────────────────

const $ = id => document.getElementById(id);

const STATUS_LABELS = {
  'pending':     'En attente',
  'in-progress': 'En cours',
  'review':      'En révision',
  'delivered':   'Livré',
};

/* ── Auth state ── */
auth.onAuthStateChanged(user => {
  if (user && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
    showPanel(user);
  } else if (user) {
    auth.signOut(); // Logged in but not admin
  }
});

/* ── Admin login ── */
$('adminLoginForm').addEventListener('submit', async e => {
  e.preventDefault();
  const email = $('adminEmail').value.trim().toLowerCase();
  const pwd   = $('adminPassword').value;
  const errEl = $('adminLoginError');
  const label = $('adminLoginLabel');

  if (email !== ADMIN_EMAIL.toLowerCase()) {
    errEl.textContent = 'Accès refusé.';
    return;
  }

  label.textContent = 'Connexion...';
  e.target.querySelector('.btn-auth').disabled = true;

  try {
    await auth.signInWithEmailAndPassword(email, pwd);
  } catch {
    errEl.textContent = 'Identifiants incorrects.';
    label.textContent = 'Connexion';
    e.target.querySelector('.btn-auth').disabled = false;
  }
});

/* ── Logout ── */
$('adminLogout').addEventListener('click', async () => {
  await auth.signOut();
  $('adminPanel').classList.add('hidden');
  $('adminLogin').classList.remove('hidden');
});

/* ── Show panel ── */
function showPanel(user) {
  $('adminLogin').classList.add('hidden');
  $('adminPanel').classList.remove('hidden');
  $('adminUserEmail').textContent = user.email;
  loadDevisRequests();
  loadOrders();
}

/* ── Devis requests ── */
function loadDevisRequests() {
  const wrap = $('devisWrap');

  db.collection('devisRequests')
    .orderBy('createdAt', 'desc')
    .limit(30)
    .onSnapshot(snap => {
      if (snap.empty) {
        wrap.innerHTML = '<p class="font-mono" style="color:var(--gray);padding:1.5rem 0">Aucune demande reçue.</p>';
        return;
      }

      let rows = '';
      snap.forEach(doc => {
        const d    = doc.data();
        const date = d.createdAt?.toDate?.().toLocaleDateString('fr-FR') ?? '—';
        rows += `<tr>
          <td class="font-mono">${date}</td>
          <td>${esc(d.prenom ?? '')} ${esc(d.nom ?? '')}</td>
          <td class="c-blue">${esc(d.email ?? '')}</td>
          <td>${esc(d.type ?? '')}</td>
          <td style="max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(d.description ?? '')}</td>
          <td>
            <button class="btn-create-order"
              data-email="${esc(d.email)}"
              data-type="${esc(d.type)}"
              data-name="${esc(d.prenom ?? '')} ${esc(d.nom ?? '')}">
              Créer projet →
            </button>
          </td>
        </tr>`;
      });

      wrap.innerHTML = `<table class="admin-table">
        <thead><tr><th>Date</th><th>Nom</th><th>Email</th><th>Type</th><th>Description</th><th></th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`;

      wrap.querySelectorAll('.btn-create-order').forEach(btn => {
        btn.addEventListener('click', () =>
          openModal(null, btn.dataset.email, btn.dataset.type)
        );
      });
    });
}

/* ── Orders ── */
function loadOrders() {
  const wrap = $('ordersWrap');

  db.collection('orders')
    .orderBy('createdAt', 'desc')
    .onSnapshot(snap => {
      if (snap.empty) {
        wrap.innerHTML = '<p class="font-mono" style="color:var(--gray);padding:1.5rem 0">Aucun projet créé.</p>';
        return;
      }

      let rows = '';
      snap.forEach(doc => {
        const d = doc.data();
        rows += `<tr>
          <td><strong>${esc(d.title ?? '')}</strong></td>
          <td class="c-blue">${esc(d.clientEmail ?? '')}</td>
          <td>${esc(d.type ?? '')}</td>
          <td>${STATUS_LABELS[d.status] ?? d.status ?? '—'}</td>
          <td class="font-mono">${d.currentStep ?? 0}/5</td>
          <td>
            <button class="btn-edit" data-id="${doc.id}">Modifier →</button>
          </td>
        </tr>`;
      });

      wrap.innerHTML = `<table class="admin-table">
        <thead><tr><th>Projet</th><th>Client</th><th>Type</th><th>Statut</th><th>Étape</th><th></th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`;

      wrap.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', async () => {
          const doc = await db.collection('orders').doc(btn.dataset.id).get();
          openModal(btn.dataset.id, null, null, doc.data());
        });
      });
    });
}

/* ── Modal ── */
$('addOrderBtn').addEventListener('click', () => openModal());
$('modalClose').addEventListener('click', closeModal);
$('orderModal').addEventListener('click', e => { if (e.target === $('orderModal')) closeModal(); });

function openModal(id = null, email = '', type = 'Site Vitrine', data = null) {
  $('orderId').value   = id ?? '';
  $('oEmail').value    = data?.clientEmail ?? email ?? '';
  $('oTitle').value    = data?.title ?? '';
  $('oType').value     = data?.type ?? type ?? 'Site Vitrine';
  $('oStatus').value   = data?.status ?? 'pending';
  $('oStep').value     = data?.currentStep ?? 0;
  $('oNotes').value    = data?.notes ?? '';

  $('modalHeading').textContent     = id ? 'Modifier le projet' : 'Nouveau projet';
  $('modalSubmitLabel').textContent = id ? 'Enregistrer' : 'Créer le projet';

  $('orderModal').classList.remove('hidden');
}

function closeModal() { $('orderModal').classList.add('hidden'); }

$('orderForm').addEventListener('submit', async e => {
  e.preventDefault();
  const id  = $('orderId').value;
  const btn = e.target.querySelector('.btn-auth');
  btn.disabled = true;

  const payload = {
    clientEmail:  $('oEmail').value.trim().toLowerCase(),
    title:        $('oTitle').value.trim(),
    type:         $('oType').value,
    status:       $('oStatus').value,
    currentStep:  Number($('oStep').value),
    notes:        $('oNotes').value.trim(),
    updatedAt:    firebase.firestore.FieldValue.serverTimestamp(),
  };

  try {
    if (id) {
      await db.collection('orders').doc(id).update(payload);
    } else {
      payload.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      await db.collection('orders').add(payload);
    }
    closeModal();
  } finally {
    btn.disabled = false;
  }
});

/* ── Helpers ── */
function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
