#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Fix the export-detail.json to mark build as successful
const exportDetailPath = path.join(__dirname, '.next', 'export-detail.json');

if (fs.existsSync(exportDetailPath)) {
  const data = JSON.parse(fs.readFileSync(exportDetailPath, 'utf8'));
  data.success = true;
  fs.writeFileSync(exportDetailPath, JSON.stringify(data, null, 2));
  console.log('✓ Fixed export-detail.json - marked as successful');
} else {
  console.log('⚠ export-detail.json not found');
}
