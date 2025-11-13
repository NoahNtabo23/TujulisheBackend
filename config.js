// config.js
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const Disaster = db.collection("Disasters");
const Partner = db.collection("Partners");   

module.exports = {Disaster,Partner };  
