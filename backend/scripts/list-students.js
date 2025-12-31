const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '../../Form 2 2025 Class list.xlsx');

try {
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    console.log('--- STUDENT NAMES FROM EXCEL ---');
    data.slice(0, 10).forEach((row, i) => {
        // Try to find a name column
        const name = row['Name'] || row['Student Name'] || row['FULL NAME'] || Object.values(row)[1];
        const adm = row['Adm'] || row['Admission Number'] || Object.values(row)[0];
        console.log(`${i + 1}. ${name} (Adm: ${adm})`);
    });
    console.log('-------------------------------');
} catch (err) {
    console.error('Error reading excel:', err.message);
}
