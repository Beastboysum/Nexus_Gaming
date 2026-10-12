import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  FacebookAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  getDocFromServer, 
  setDoc, 
  getDocs, 
  collection, 
  query, 
  where 
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { User } from '../types';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: Must pass firestoreDatabaseId according to Firebase skill
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Auth Providers
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const facebookProvider = new FacebookAuthProvider();
facebookProvider.addScope('email');
facebookProvider.addScope('public_profile');

// Error Handling conforming to FirestoreErrorInfo
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test Connection on Boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

// ==========================================
// Authentication & User Profile Services
// ==========================================

export const AuthService = {
  // Crosscheck in the server/database if an email exists
  async checkEmailExistsInServer(email: string): Promise<boolean> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return false;

    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', cleanEmail));
      const querySnap = await getDocs(q);
      return !querySnap.empty;
    } catch (error) {
      console.warn('Error checking email existence, falling back to local registry check:', error);
      // Fallback check against cached registered users
      const cached = localStorage.getItem('nexus_registered_emails');
      if (cached) {
        try {
          const list: string[] = JSON.parse(cached);
          return list.includes(cleanEmail);
        } catch (_) {}
      }
      return false;
    }
  },

  // Check if a gamer tag / username is already taken
  async isUsernameAvailable(username: string): Promise<boolean> {
    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername) return false;

    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', username.trim()));
      const snap = await getDocs(q);
      return snap.empty;
    } catch (error) {
      return true; // Allow if network issue
    }
  },

  // Fetch user profile from Firestore by UID
  async getUserProfile(uid: string): Promise<User | null> {
    try {
      const docSnap = await getDoc(doc(db, 'users', uid));
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: uid,
          username: data.username || 'Gamer',
          avatar: data.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${uid}`,
          status: data.status || 'online',
          email: data.email,
          provider: data.provider,
          createdAt: data.createdAt,
        };
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${uid}`);
      return null;
    }
  },

  // Save or update user profile in Firestore
  async saveUserProfile(uid: string, profile: { username: string; email?: string; avatar?: string; provider?: string }): Promise<User> {
    const userDoc: User = {
      id: uid,
      username: profile.username.trim(),
      avatar: profile.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(profile.username)}`,
      status: 'online',
      email: profile.email?.toLowerCase(),
      provider: profile.provider || 'password',
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'users', uid), userDoc, { merge: true });
      
      // Cache email locally as known registered email
      if (profile.email) {
        try {
          const cached = localStorage.getItem('nexus_registered_emails');
          const list: string[] = cached ? JSON.parse(cached) : [];
          if (!list.includes(profile.email.toLowerCase())) {
            list.push(profile.email.toLowerCase());
            localStorage.setItem('nexus_registered_emails', JSON.stringify(list));
          }
        } catch (_) {}
      }

      return userDoc;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${uid}`);
      return userDoc;
    }
  },

  // Sign in with Google Popup
  async loginWithGoogle(): Promise<{ user: FirebaseUser; isNewUser: boolean; existingProfile: User | null }> {
    const result = await signInWithPopup(auth, googleProvider);
    const existingProfile = await this.getUserProfile(result.user.uid);
    return {
      user: result.user,
      isNewUser: !existingProfile,
      existingProfile,
    };
  },

  // Sign in with Facebook Popup
  async loginWithFacebook(): Promise<{ user: FirebaseUser; isNewUser: boolean; existingProfile: User | null }> {
    const result = await signInWithPopup(auth, facebookProvider);
    const existingProfile = await this.getUserProfile(result.user.uid);
    return {
      user: result.user,
      isNewUser: !existingProfile,
      existingProfile,
    };
  },

  // Register with Email and Password
  async registerWithEmail(email: string, pass: string): Promise<FirebaseUser> {
    const res = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    return res.user;
  },

  // Login with Email and Password
  async loginWithEmail(email: string, pass: string): Promise<{ user: FirebaseUser; profile: User | null }> {
    const res = await signInWithEmailAndPassword(auth, email.trim(), pass);
    const profile = await this.getUserProfile(res.user.uid);
    return {
      user: res.user,
      profile,
    };
  },

  // Sign out
  async logout(): Promise<void> {
    await signOut(auth);
  }
};
