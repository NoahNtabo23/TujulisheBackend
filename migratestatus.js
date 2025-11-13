// migrate-status.js
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

(async () => {
  const snapshot = await db.collection("Disasters").get();
  let updated = 0;
  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (!data.status) {
      await doc.ref.update({ status: "pending" });
      updated++;
    }
  }
  console.log("Updated docs:", updated);
  process.exit(0);
})();
