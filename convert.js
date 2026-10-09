const fs = require('fs');
const text = fs.readFileSync('amazon.csv', 'utf-8');

// Proper CSV parser handling quoted fields with newlines
function parseCSV(text) {
  const rows = [];
  let i = 0;
  
  function parseField() {
    if (i >= text.length) return '';
    if (text[i] === '"') {
      i++; // skip opening quote
      let val = '';
      while (i < text.length) {
        if (text[i] === '"') {
          if (i + 1 < text.length && text[i + 1] === '"') {
            val += '"';
            i += 2;
          } else {
            i++; // skip closing quote
            break;
          }
        } else {
          val += text[i];
          i++;
        }
      }
      return val;
    } else {
      let val = '';
      while (i < text.length && text[i] !== ',' && text[i] !== '\n' && text[i] !== '\r') {
        val += text[i];
        i++;
      }
      return val;
    }
  }
  
  while (i < text.length) {
    const row = [];
    while (true) {
      row.push(parseField());
      if (i >= text.length || text[i] === '\n' || text[i] === '\r') {
        // skip newline chars
        while (i < text.length && (text[i] === '\n' || text[i] === '\r')) i++;
        break;
      }
      if (text[i] === ',') i++; // skip comma
    }
    if (row.length > 1 || (row.length === 1 && row[0].trim() !== '')) {
      rows.push(row);
    }
  }
  return rows;
}

const allRows = parseCSV(text);
const headers = allRows[0];
console.log('Headers:', headers);
console.log('Total data rows:', allRows.length - 1);

const data = [];
for (let i = 1; i < allRows.length; i++) {
  const vals = allRows[i];
  if (vals.length < 7) continue;
  
  const cat = (vals[2] || '').split('|')[0];
  const sub = (vals[2] || '').split('|').length > 1 ? (vals[2] || '').split('|')[1] : cat;
  const dp = parseFloat((vals[5] || '0').replace('%', '')) || 0;
  const ap = parseFloat((vals[4] || '0').replace(/[₹,]/g, '')) || 0;
  const sp = parseFloat((vals[3] || '0').replace(/[₹,]/g, '')) || 0;
  const r = parseFloat(vals[6]) || 0;
  const rc = parseInt((vals[7] || '0').replace(/,/g, '')) || 0;
  
  data.push({
    n: (vals[1] || '').substring(0, 80),
    c: cat,
    s: sub,
    d: dp,
    a: ap,
    p: sp,
    r: r,
    rc: rc
  });
}

fs.writeFileSync('data.json', JSON.stringify(data));
console.log('Done:', data.length, 'records exported');
console.log('Sample:', JSON.stringify(data[0]));
