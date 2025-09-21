// src/services/firebaseAdmin.js
import admin from "firebase-admin";
import fs from "fs";

let initialized = false;

export function initFirebaseAdmin() {
  if (initialized) return admin;

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT; // full JSON string (preferred)
  const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS; // or path to JSON

  let credential;
  if (serviceAccountJson) {
    // parse JSON string from env
    const obj = JSON.parse(serviceAccountJson);
    credential = admin.credential.cert(obj);
  } else if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
    const obj = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
    credential = admin.credential.cert(obj);
  } else {
    // fallback to default (e.g., GCE metadata). This will error if not configured.
    credential = admin.credential.applicationDefault();
  }

  admin.initializeApp({ credential });
  initialized = true;
  console.log("[FirebaseAdmin] initialized");
  return admin;
}
