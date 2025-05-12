const admin = require('firebase-admin');
const ExcelJS = require('exceljs');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const { flattenObject } = require('./excelUtils');

admin.initializeApp({
    credential: admin.credential.cert(require('./serviceAccountKey.json')),
});

const db = admin.firestore();
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = q => new Promise(r => rl.question(q, r));

// Format timestamp as YYYYMMDD-HHmm
function getTimestamp() {
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
}

async function exportCollection() {
    try {
        const collections = await db.listCollections();
        const collectionNames = collections.map(c => c.id);

        if (collectionNames.length === 0) throw new Error('No collections found.');
        console.log('\nAvailable collections:\n');
        collectionNames.forEach((name, i) => console.log(`${i + 1}. ${name}`));

        const index = parseInt(await ask('\nEnter the number of the collection to export: '), 10) - 1;
        if (isNaN(index) || index < 0 || index >= collectionNames.length) throw new Error('Invalid selection.');
        const collectionName = collectionNames[index];

        const snapshot = await db.collection(collectionName).get();
        if (snapshot.empty) throw new Error('Collection is empty.');

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(collectionName);
        let headersSet = false;

        snapshot.forEach(doc => {
            const flat = flattenObject({ id: doc.id, ...doc.data() });
            if (!headersSet) {
                worksheet.columns = Object.keys(flat).map(key => ({ header: key, key }));
                headersSet = true;
            }
            worksheet.addRow(flat);
        });

        // Create export folder if it doesn't exist
        const exportDir = path.join(__dirname, 'data/export');
        if (!fs.existsSync(exportDir)) {
            fs.mkdirSync(exportDir, { recursive: true });
        }

        const timestamp = getTimestamp();
        const filePath = path.join(exportDir, `${collectionName}-${timestamp}.xlsx`);
        await workbook.xlsx.writeFile(filePath);
        console.log(`✅ Exported '${collectionName}' to ${filePath}`);
    } catch (e) {
        console.error('❌ Export failed:', e);
    } finally {
        rl.close();
    }
}

exportCollection();
