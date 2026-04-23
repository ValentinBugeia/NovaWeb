'use strict';

/* ── Tab switching ── */
document.querySelectorAll('.auth-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const isLogin = tab.dataset.tab === 'login';
    document.getElementById('loginForm').classList.toggle('hidden', !isLogin);
    document.getElementById('registerForm').classList.toggle('hidden', isLogin);
  });
});

/* ── Redirect if already logged in ── */
auth.onAuthStateChanged(user => {
  if (user) window.location.href = 'dashboard.html';
});

/* ── Login ── */
document.getElementById('loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errEl    = document.getElementById('loginError');
  const label    = document.getElementById('loginLabel');
  errEl.textContent = '';
  label.textContent = 'Connexion...';
  e.target.querySelector('.btn-auth').disabled = true;

  try {
    await auth.signInWithEmailAndPassword(email, password);
    window.location.href = 'dashboard.html';
  } catch (err) {
    errEl.textContent = translateError(err.code);
    label.textContent = 'Se connecter';
    e.target.querySelector('.btn-auth').disabled = false;
  }
});

/* ── Register ── */
document.getElementById('registerForm').addEventListener('submit', async e => {
  e.preventDefault();
  const prenom   = document.getElementById('regPrenom').value.trim();
  const nom      = document.getElementById('regNom').value.trim();
  const email    = document.getElementById('regEmail').value.trim().toLowerCase();
  const password = document.getElementById('regPassword').value;
  const errEl    = document.getElementById('registerError');
  const label    = document.getElementById('registerLabel');
  errEl.textContent = '';
  label.textContent = 'Création...';
  e.target.querySelector('.btn-auth').disabled = true;

  try {
    const { user } = await auth.createUserWithEmailAndPassword(email, password);
    await db.collection('users').doc(user.uid).set({
      prenom, nom, email,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    window.location.href = 'dashboard.html';
  } catch (err) {
    errEl.textContent = translateError(err.code);
    label.textContent = 'Créer mon compte';
    e.target.querySelector('.btn-auth').disabled = false;
  }
});

function translateError(code) {
  return {
    'auth/email-already-in-use': 'Cet email est déjà utilisé.',
    'auth/invalid-email':        'Email invalide.',
    'auth/weak-password':        'Mot de passe trop faible (6 caractères min.).',
    'auth/user-not-found':       'Aucun compte avec cet email.',
    'auth/wrong-password':       'Mot de passe incorrect.',
    'auth/invalid-credential':   'Email ou mot de passe incorrect.',
    'auth/too-many-requests':    'Trop de tentatives. Réessayez plus tard.',
  }[code] || 'Une erreur est survenue. Réessayez.';
}
