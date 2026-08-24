import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';

// File Configuration
const EXCEL_FILE_PATH = path.resolve(__dirname, 'convert-to-TS.xlsx');

// ALLOWED ACTIVITY MATRICES (Strict Validation Rules)
const VALID_LAND_ACTIVITIES = new Set([
  'fris', 'art', 'hike', 'pball', 'bball', 'cheer',
  'fball', 'lax', 'soc', 'vball', 'yoga', 'arch'
]);

const VALID_WATER_ACTIVITIES = new Set([
  'fish', 'pboard', 'snork', 'canoe', 'kayak', 'sail', 'swim'
]);

async function generateTypeScriptDatasets() {
  try {
    const workbook = new ExcelJS.Workbook();

    // Read the spreadsheet safely in memory
    await workbook.xlsx.readFile(EXCEL_FILE_PATH);

    console.log(`\n======================================================`);
    console.log(`🚀 Starting Multi-Sheet Processing & Validation Engine`);
    console.log(`======================================================`);

    // Process each sheet inside the workbook dynamically
    for (const worksheet of workbook.worksheets) {
      const sheetName = worksheet.name.trim();

      // Basic normalization to ensure clean output filenames (e.g., "dataset147.ts")
      const safeFileName = sheetName.toLowerCase().startsWith('dataset')
        ? `${sheetName.toLowerCase()}.ts`
        : `dataset${sheetName}.ts`;

      const OUTPUT_TS_PATH = path.resolve(__dirname, safeFileName);
      const formattedDataset: string[][] = [];

      console.log(`\n📊 Processing Sheet: "${sheetName}" -> Target Output: ${safeFileName}`);

      // Iterate through rows with data
      worksheet.eachRow((row, rowNumber) => {
        // Skip Header Row 1 completely
        if (rowNumber === 1) return;

        const rowValues = (row.values as any[]);
        if (!rowValues || rowValues.length < 2) return;

        const lastName = String(rowValues[1] || '').trim();
        const firstName = String(rowValues[2] || '').trim();

        // Safety guard against stray blank lines
        if (!lastName && !firstName) return;

        // Land Activities: Columns D, E, F (Indices 4, 5, 6)
        const land1 = String(rowValues[4] || '').trim();
        const land2 = String(rowValues[5] || '').trim();
        const land3 = String(rowValues[6] || '').trim();

        // Water Activities: Columns G, H, I (Indices 7, 8, 9)
        const water1 = String(rowValues[7] || '').trim();
        const water2 = String(rowValues[8] || '').trim();
        const water3 = String(rowValues[9] || '').trim();

        const lands = [land1, land2, land3];
        const waters = [water1, water2, water3];

        // --- VALIDATION LAYER ---
        const camperContext = `[Row ${rowNumber}] Camper: ${firstName} ${lastName}`;

        // 1. Check Land Activities
        lands.forEach((act, idx) => {
          if (!VALID_LAND_ACTIVITIES.has(act)) {
            throw new Error(
              `❌ INVALID LAND ACTIVITY TRIGGERED!\n` +
              `Context: ${camperContext}\n` +
              `Found invalid entry: "${act}" at Land Slot ${idx + 1}.\n` +
              `Allowed values: [${Array.from(VALID_LAND_ACTIVITIES).join(', ')}]`
            );
          }
        });

        // 2. Check Water Activities
        waters.forEach((act, idx) => {
          if (!VALID_WATER_ACTIVITIES.has(act)) {
            throw new Error(
              `❌ INVALID WATER ACTIVITY TRIGGERED!\n` +
              `Context: ${camperContext}\n` +
              `Found invalid entry: "${act}" at Water Slot ${idx + 1}.\n` +
              `Allowed values: [${Array.from(VALID_WATER_ACTIVITIES).join(', ')}]`
            );
          }
        });

        // // 3. Row-Level Duplicate Check
        // const totalActs = [...lands, ...waters];
        // const uniqueActs = new Set(totalActs);
        // if (uniqueActs.size !== totalActs.length) {
        //   throw new Error(
        //     `❌ DUPLICATE ACTIVITY DETECTED PER CAMPER ROW!\n` +
        //     `Context: ${camperContext}\n` +
        //     `Activities logged: [${totalActs.join(', ')}]\n` +
        //     `Please ensure campers do not have identical selections duplicated.`
        //   );
        // }

        // Keep variable name clean and reflective of file name (e.g. export const dataset147)
        formattedDataset.push([lastName, firstName, ...lands, ...waters]);
      });

      // Construct TypeScript file layout content
      const arrayVarName = safeFileName.replace('.ts', '');
      let fileContent = `/**\n * Auto-generated camper dataset matrix arrays\n * Source Sheet: ${sheetName}\n * Total Count: ${formattedDataset.length} rows\n */\n\n`;
      fileContent += `export const ${arrayVarName}: string[][] = [\n`;

      formattedDataset.forEach(row => {
        const lineItems = row.map(val => `'${val.replace(/'/g, "\\'")}'`).join(', ');
        fileContent += `  [${lineItems}],\n`;
      });

      fileContent += `];\n`;

      // Save files right into the script folder
      fs.writeFileSync(OUTPUT_TS_PATH, fileContent, 'utf-8');
      console.log(`   ✨ Saved successfully! Generated ${formattedDataset.length} rows.`);
    }

    console.log(`\n======================================================`);
    console.log(`✅ All workbook tabs validated and extracted flawlessly!`);
    console.log(`======================================================\n`);

  } catch (error: any) {
    console.error(`\n🛑 COMPILATION TERMINATED DUE TO VALIDATION FAILURE:`);
    console.error(error.message || error);
    console.log(`\n======================================================\n`);
    process.exit(1); // Stop execution immediately to protect pipelines
  }
}

generateTypeScriptDatasets();
