const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.setCustomClaims = functions.https.onCall(async (data, context) => {
  // Verify the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Only allow admins to set roles
  const callerUid = context.auth.uid;
  const callerClaims = (await admin.auth().getUser(callerUid)).customClaims;
  if (!callerClaims?.admin && data.role === 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can create other admins');
  }

  const { uid, role } = data;
  if (!uid || !role) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing uid or role');
  }

  try {
    await admin.auth().setCustomUserClaims(uid, { [role]: true });
    return { success: true };
  } catch (error) {
    console.error('Error setting custom claims:', error);
    throw new functions.https.HttpsError('internal', 'Error setting user role');
  }
});
