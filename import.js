const admin = require('firebase-admin');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const { parseFields } = require('./excelUtils');
const { upsertToFirestore, addIfNotExists, removeUndefinedFields } = require('./firestoreUtils');

admin.initializeApp({
  credential: admin.credential.cert(require('./serviceAccountKey.json')),
});

const db = admin.firestore();
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = q => new Promise(r => rl.question(q, r));

async function importFromExcel() {
  try {
    const fileName = (await ask('Enter Excel filename inside /data/import (default: data.xlsx): ')).trim() || 'data.xlsx';
    const filePath = path.join(__dirname, 'data/import', fileName);
    if (!fs.existsSync(filePath)) throw new Error(`File not found: ${filePath}`);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.worksheets[0];

    const headers = worksheet.getRow(1).values.slice(1);
    const rows = [];
    worksheet.eachRow((row, i) => {
      if (i === 1) return;
      const item = {};
      row.values.slice(1).forEach((val, idx) => (item[headers[idx]] = val));
      rows.push(item);
    });

    const collections = await db.listCollections();
    const collectionNames = collections.map(c => c.id);
    collectionNames.forEach((name, i) => console.log(`${i + 1}. ${name}`));

    const index = parseInt(await ask('\nEnter the number of the collection to import into: '), 10) - 1;
    if (isNaN(index) || index < 0 || index >= collectionNames.length) throw new Error('Invalid selection.');
    const collectionRef = db.collection(collectionNames[index]);

    const mode = (await ask('Choose mode (update / add): ')).trim().toLowerCase();
    if (!['update', 'add'].includes(mode)) throw new Error('Invalid mode.');

    for (const rawItem of rows) {
      const safeItem = removeUndefinedFields(parseFields(rawItem));
      const result = mode === 'update'
          ? await upsertToFirestore(collectionRef, safeItem)
          : await addIfNotExists(collectionRef, safeItem);
      console.log(`📦 ${result.status.toUpperCase()}: ${result.name}`);
    }

    console.log(`✅ Import into '${collectionNames[index]}' using '${mode}' mode completed.`);
  } catch (e) {
    console.error('❌ Import failed:', e);
  } finally {
    rl.close();
  }
}

importFromExcel();
