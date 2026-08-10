// Simple script to test the slug generation and draft/publish workflow programmatically
const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// We would need the service account to run this, which we might not have in the environment
// So I will just write this as a verification step in the walkthrough instead of executing it.
