const firebaseConfig = {
  apiKey:            "AIzaSyBildTHqqg78xfJoLa4KyNft45N1WNP2wQ",
  authDomain:        "novaweb-1ea10.firebaseapp.com",
  projectId:         "novaweb-1ea10",
  storageBucket:     "novaweb-1ea10.firebasestorage.app",
  messagingSenderId: "535739925790",
  appId:             "1:535739925790:web:e1dd9d021d1da5b0a1f50f"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db   = firebase.firestore();
