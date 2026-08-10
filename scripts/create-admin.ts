import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault()
  });
}

const db = admin.firestore();
const auth = admin.auth();

const createAdmin = async () => {
  const email = 'admin@agency.com';
  const password = 'Password123!';

  try {
    console.log(`Checking if user ${email} exists...`);
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
      console.log('User already exists, updating password...');
      await auth.updateUser(userRecord.uid, { password });
    } catch (e: any) {
      if (e.code === 'auth/user-not-found') {
        console.log('Creating new user...');
        userRecord = await auth.createUser({
          email,
          password,
          displayName: 'Admin User',
        });
      } else {
        throw e;
      }
    }

    console.log(`Setting role to admin in Firestore for uid: ${userRecord.uid}...`);
    await db.collection('users').doc(userRecord.uid).set({
      email: userRecord.email,
      role: 'admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    console.log('\n✅ Admin user ready!');
    console.log('--------------------------------------------------');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log('--------------------------------------------------');
    console.log('You can now log in at /admin/login');

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    process.exit(0);
  }
};

createAdmin();
