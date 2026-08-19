import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
  Auth
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App singleton safely
let auth: Auth | null = null;
let provider: GoogleAuthProvider | null = null;

try {
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  provider = new GoogleAuthProvider();
  provider.addScope('https://www.googleapis.com/auth/drive.file');
  provider.setCustomParameters({
    prompt: 'select_account'
  });
} catch (e) {
  console.warn('Firebase initialization warning:', e);
}

export { auth };

// Flag to track sign-in state
let isSigningIn = false;
// Cache the access token in memory (never store in localStorage)
let cachedAccessToken: string | null = null;
let cachedGoogleUser: User | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  if (!auth) {
    if (onAuthFailure) onAuthFailure();
    return () => {};
  }

  try {
    return onAuthStateChanged(auth, async (user: User | null) => {
      cachedGoogleUser = user;
      if (user && cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!user) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      } else if (user && !isSigningIn) {
        // User is logged in to Firebase, but token may need refresh via sign-in
        if (onAuthSuccess && cachedAccessToken) {
          onAuthSuccess(user, cachedAccessToken);
        } else if (onAuthFailure) {
          onAuthFailure();
        }
      }
    });
  } catch (error) {
    console.warn('onAuthStateChanged error:', error);
    if (onAuthFailure) onAuthFailure();
    return () => {};
  }
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  if (!auth || !provider) {
    throw new Error('សេវាកម្ម Google Auth មិនទាន់ត្រូវបានកំណត់ឱ្យត្រឹមត្រូវនៅឡើយទេ។');
  }

  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('មិនអាចទទួលបានសិទ្ធិ Access Token ពី Google បានឡើយ។ សូមព្យាយាមម្តងទៀត។');
    }

    cachedAccessToken = credential.accessToken;
    cachedGoogleUser = result.user;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: unknown) {
    console.error('Google Sign In error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const getCurrentGoogleUser = (): User | null => {
  return cachedGoogleUser || (auth ? auth.currentUser : null);
};

export const googleLogout = async () => {
  try {
    if (auth) {
      await signOut(auth);
    }
  } finally {
    cachedAccessToken = null;
    cachedGoogleUser = null;
  }
};
