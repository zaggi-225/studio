const admin = require("firebase-admin");
const path = require("path");

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(path.join(__dirname, "serviceAccountKey.json")),
});
const db = admin.firestore();

/**
 * Batch delete all documents in a collection (recursive for subcollections).
 */
async function deleteCollection(collectionPath, batchSize = 200) {
  const collectionRef = db.collection(collectionPath);
  const snapshot = await collectionRef.get();
  if (snapshot.empty) {
    console.log(`No documents to delete in: ${collectionPath}`);
    return;
  }
  let deleted = 0;
  let batch = db.batch();
  for (const doc of snapshot.docs) {
    batch.delete(doc.ref);
    deleted++;
    if (deleted % batchSize === 0) {
      await batch.commit();
      batch = db.batch();
    }
  }
  await batch.commit();
  console.log(`Deleted collection: ${collectionPath}`);
}

/**
 * Main setup for database structure build.
 */
async function setupFirestore() {
  // Remove old collections first
  const oldCollections = [
    "sales_entries",
    "transactions",
    "aggregates",
    "app_releases",
    "audit_logs",
    "insights"
  ];
  for (const name of oldCollections) await deleteCollection(name);

  // ---- AGGREGATES ----
  // /aggregates/summary (global totals)
  await db.collection("aggregates").doc("summary").set({
    totalSales: 0,
    totalExpenses: 0,
    profit: 0,
    lastUpdated: admin.firestore.FieldValue.serverTimestamp()
  });

  // /aggregates/monthly/{YYYY-MM}/summary (monthly aggregates)
  const now = new Date();
  const monthStr = now.toISOString().slice(0, 7); // "YYYY-MM"
  await db.collection("aggregates").doc("monthly")
    .collection(monthStr).doc("summary").set({
      month: monthStr,
      salesTotal: 0,
      expensesTotal: 0,
      profitTotal: 0,
      salesByBranch: {},
      expensesByBranch: {},
    });

  // /aggregates/branch/{branchId}/summary (branch summary for known branches)
  const branchIds = ["nidagundi", "hubli"]; // Add all branchIds here as needed
  for (const branchId of branchIds) {
    await db.collection("aggregates").doc("branch")
      .collection(branchId).doc("summary").set({
        totalSales: 0,
        totalExpenses: 0,
        profit: 0,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      });
  }

  // ---- Structure Only ----
  // /transactions, /app_releases, /audit_logs, /insights handled dynamically by app/functions

  console.log("Firestore backend structure initialized: summary, monthly, branches, clean old data.");
}

// Run setup
setupFirestore().catch((err) => {
  console.error("Firestore structure setup error:", err);
  process.exit(1);
});
