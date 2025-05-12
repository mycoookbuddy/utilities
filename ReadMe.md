
# 📦 Firestore Excel Import/Export Tool

A Node.js CLI tool to **export Firestore collections to Excel** and **import them back**, with support for arrays, nested objects/maps, and image URLs (as strings). Designed for seamless roundtrip workflows.

---

## 📁 Project Structure

```
project-root/
├── package.json
├── serviceAccountKey.json            # Firebase Admin SDK key
├── importFromExcel.js                # CLI: import Excel to Firestore
├── exportCollectionPrompt.js         # CLI: export Firestore to Excel
├── excelUtils.js                     # Excel parsing helpers
├── firestoreUtils.js                 # Firestore insert/update helpers
├── data/
│   ├── import/                       # Excel files to import
│   │   └── data.xlsx
│   └── export/                       # Auto-generated Excel exports
│       └── <collection>-timestamp.xlsx
```

---

## 🚀 Setup

1. Run this command from the **project root**:

```bash
npm install
```

2. Place your **Firebase Admin SDK key** here:

```
serviceAccountKey.json
```

3. Place your **Excel import file** here:

```
data/import/data.xlsx
```

✅ Make sure the first row in the Excel file contains column headers.

---

## 📤 Export from Firestore to Excel

```bash
npm run export
```

- Prompts you to select a Firestore collection
- Exports to:
  ```
  data/export/<collection>-YYYYMMDD-HHmm.xlsx
  ```
- Arrays → comma-separated strings
- Maps → JSON strings
- Array of maps → JSON arrays

---

## 📥 Import from Excel to Firestore

```bash
npm run import
```

### Prompts:
- Excel file name from `data/import/`
- Collection to import into
- Import mode:
  - `add`: Only add new documents
  - `update`: Add or update based on `name` field

### Notes:
- Parses JSON and array fields automatically
- Skips `undefined` fields for Firestore safety

---

## 📜 Scripts in package.json

```json
"scripts": {
  "import": "node import.js",
  "export": "node export.js"
}
```

---

## 🧠 Example Field Handling

| Field        | Excel Value                                  | Stored As          |
|--------------|-----------------------------------------------|--------------------|
| `mealTypes`  | `Breakfast, Lunch`                            | Array              |
| `cuisines`   | `["Gujarati", "Marathi"]`                     | Array (from JSON)  |
| `imageUrl`   | `https://example.com/images/dosa.jpg`         | String (URL)       |
| `nutrition`  | `{"calories":200,"fat":10}`                   | Map/Object         |
| `notifications` | `[{"mealType":"Dinner",...}]`              | Array of maps      |

---

## 🔒 Requirements

- Node.js v16+
- Firebase project with Firestore enabled
- Admin SDK service account key file

---
