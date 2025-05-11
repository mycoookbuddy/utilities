const admin = require('firebase-admin');
const data = require('./data/data.json');

admin.initializeApp({
  credential: admin.credential.cert(require('./serviceAccountKey.json')),
});

const db = admin.firestore();
const collectionRef = db.collection('commonfooditem');

async function importToFirestore() {
  for (const item of data) {
    if (!item.name) {
      console.warn('Skipping item with no name:', item);
      continue;
    }

    // Check if document with same name exists
    const querySnapshot = await collectionRef.where('name', '==', item.name).get();

    if (!querySnapshot.empty) {
      // Update the first matching document
      const existingDoc = querySnapshot.docs[0];
      await existingDoc.ref.set(item, { merge: true });
      console.log(`Updated document with name: ${item.name}`);
    } else {
      // Create a new document
      await collectionRef.add(item);
      console.log(`Created new document for name: ${item.name}`);
    }
  }

  console.log('Import completed.');
}

importToFirestore().catch(console.error);
