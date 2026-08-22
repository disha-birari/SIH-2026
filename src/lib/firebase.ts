// Official Bureau of Indian Standards - Firebase Production Integration
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, collection, addDoc, getDocs, doc, setDoc, query, orderBy, limit 
} from 'firebase/firestore';
import { getDatabase, ref, set, push, onValue, get, child } from 'firebase/database';
import { 
  getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User 
} from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDUl4wbJ3zShF8t9qahdKiInh7ATgp9YQQ",
  authDomain: "project-2447457501485114884.firebaseapp.com",
  databaseURL: "https://project-2447457501485114884-default-rtdb.firebaseio.com",
  projectId: "project-2447457501485114884",
  storageBucket: "project-2447457501485114884.firebasestorage.app",
  messagingSenderId: "891252027777",
  appId: "1:891252027777:web:e8c398a77451ecb6d33880",
  measurementId: "G-HMP81F21WC"
};

// Initialize Firebase App Instance
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Export Firebase Core Services
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Configure Google Provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Safe Analytics Initialization
export const analytics = typeof window !== 'undefined' ? isSupported().then(yes => yes ? getAnalytics(app) : null) : null;

// ============================================================================
// GOOGLE AUTHENTICATION HELPERS
// ============================================================================

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    // Store user profile in Firestore
    if (result.user) {
      const userRef = doc(db, 'users', result.user.uid);
      await setDoc(userRef, {
        uid: result.user.uid,
        displayName: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL,
        lastLogin: new Date().toISOString(),
        role: 'user'
      }, { merge: true });
    }
    return result.user;
  } catch (error: any) {
    console.error("Google Auth Sign In Error:", error);
    throw error;
  }
}

export async function logoutFirebase() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Sign Out Error:", error);
  }
}

export function subscribeAuthState(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// ============================================================================
// FIREBASE DATABASE (FIRESTORE & REALTIME DB) PERSISTENCE & SYNC
// ============================================================================

// Firebase Feedback Persistence
export async function saveFeedbackLocal(queryText: string, isHelpful: boolean, feedbackText?: string) {
  const payload = {
    timestamp: new Date().toISOString(),
    query: queryText,
    isHelpful,
    feedbackText: feedbackText || ''
  };

  // Local Backup
  try {
    const existing = JSON.parse(localStorage.getItem('bis_feedback_logs') || '[]');
    existing.push(payload);
    localStorage.setItem('bis_feedback_logs', JSON.stringify(existing));
  } catch (e) {
    console.warn("LocalStorage fallback warning", e);
  }

  // Firebase Realtime DB & Firestore Sync
  try {
    await addDoc(collection(db, 'feedback_logs'), payload);
    const rtdbRef = ref(rtdb, 'feedback/' + Date.now());
    await set(rtdbRef, payload);
  } catch (err) {
    console.warn("Firebase sync info:", err);
  }
}

export async function fetchFeedbackLogsFromFirebase(): Promise<any[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'feedback_logs'));
    const logs: any[] = [];
    querySnapshot.forEach((docSnap) => {
      logs.push(docSnap.data());
    });
    if (logs.length > 0) return logs;
  } catch (e) {
    console.warn("Firestore fetch error, falling back to local/rtdb", e);
  }

  return getFeedbackLogsLocal();
}

export function getFeedbackLogsLocal() {
  try {
    return JSON.parse(localStorage.getItem('bis_feedback_logs') || '[]');
  } catch (e) {
    return [];
  }
}

// Firebase Custom Standard Persistence
export async function saveCustomStandardToFirebase(standardData: any) {
  try {
    await addDoc(collection(db, 'custom_standards'), {
      ...standardData,
      createdAt: new Date().toISOString()
    });
    const rtdbRef = ref(rtdb, 'standards/' + standardData.id);
    await set(rtdbRef, standardData);
  } catch (err) {
    console.warn("Firebase standard save info:", err);
  }
}

// Fetch all standards from Firestore & Realtime DB
export async function fetchStandardsFromFirebase(): Promise<any[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'bis_standards'));
    const fetched: any[] = [];
    querySnapshot.forEach((docSnap) => {
      fetched.push(docSnap.data());
    });
    if (fetched.length > 0) {
      return fetched;
    }
  } catch (err) {
    console.warn("Firestore standards fetch warning:", err);
  }

  // Fallback to Realtime DB
  try {
    const dbRef = ref(rtdb);
    const snapshot = await get(child(dbRef, `standards`));
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.values(data);
    }
  } catch (err) {
    console.warn("Realtime DB standards fetch warning:", err);
  }

  return [];
}

// Auto-seed initial database into Firestore & Realtime DB if empty
export async function seedInitialDatabaseIfEmpty(initialStandards: any[]) {
  try {
    const existing = await fetchStandardsFromFirebase();
    if (existing.length === 0 && initialStandards.length > 0) {
      console.log("Seeding Firebase Firestore & Realtime DB with initial standards...");
      for (const std of initialStandards) {
        try {
          const docRef = doc(db, 'bis_standards', std.id);
          await setDoc(docRef, { ...std, seededAt: new Date().toISOString() }, { merge: true });
          const rtdbRef = ref(rtdb, 'standards/' + std.id);
          await set(rtdbRef, std);
        } catch (e) {
          console.warn(`Error seeding standard ${std.id}:`, e);
        }
      }
      console.log("Database successfully seeded!");
    }
  } catch (err) {
    console.warn("Auto-seed error:", err);
  }
}

// Firebase Gap Analysis Audit Logs
export async function saveGapAnalysisToFirebase(gapResult: any) {
  try {
    await addDoc(collection(db, 'gap_analysis_audits'), {
      ...gapResult,
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn("Firebase gap analysis sync info:", err);
  }
}

