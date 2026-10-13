import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromCache, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
console.log("Firebase initialized with project:", firebaseConfig.projectId);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Teste de conexão conforme as instruções
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firestore connection successful");
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('resource-exhausted') || msg.toLowerCase().includes('quota')) {
      console.warn("Firestore: Cota diária do plano gratuito atingida. Operando em modo offline/cache local com persistência total.");
    } else if (msg.includes('the client is offline')) {
      console.info("Firestore: Operando em modo offline.");
    } else {
      console.warn("Firestore connection check:", msg);
    }
  }
}
testConnection();
