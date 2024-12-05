import { getAuth } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';

export const setUserRole = async (uid, role) => {
  try {
    const functions = getFunctions();
    const setCustomClaims = httpsCallable(functions, 'setCustomClaims');
    await setCustomClaims({ uid, role });
    
    // Force token refresh
    const auth = getAuth();
    if (auth.currentUser) {
      await auth.currentUser.getIdToken(true);
    }
    
    return true;
  } catch (error) {
    console.error('Error setting user role:', error);
    throw error;
  }
};
