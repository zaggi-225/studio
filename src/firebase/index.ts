'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence, Firestore } from 'firebase/firestore';

let firestoreInstance: Firestore | null = null;

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebaseApp(): FirebaseApp {
  if (getApps().length) {
    return getApp();
  }
  try {
    return initializeApp();
  } catch (e) {
    if (process.env.NODE_ENV === "production") {
      console.warn('Automatic initialization failed. Falling back to firebase config object.', e);
    }
    return initializeApp(firebaseConfig);
  }
}

export function getFirebaseServices(app: FirebaseApp) {
  if (!firestoreInstance) {
    firestoreInstance = getFirestore(app);
    enableIndexedDbPersistence(firestoreInstance).catch((err) => {
      if (err.code == 'failed-precondition') {
        console.log('Multiple tabs open, persistence can only be enabled in one tab at a time.');
      } else if (err.code == 'unimplemented') {
        console.log('The current browser does not support all of the features required to enable persistence.');
      }
    });
  }

  return {
    firebaseApp: app,
    auth: getAuth(app),
    firestore: firestoreInstance
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
