import fs from 'fs';
import path from 'path';

const directory = './src';

const replacements = {
  '#2563eb': '#ff9600', // primary
  '#60a5fa': '#ffb44d', // light
  '#1d4ed8': '#cc7800', // dark
  'rgba(37, 99, 235, 0.15)': 'rgba(255, 150, 0, 0.15)',
  'rgba(37, 99, 235, 0.10)': 'rgba(255, 150, 0, 0.10)',
  '#1e3a8a': '#cc7800'  // darker shadow (from index.css change)
};

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      
      for (const [key, value] of Object.entries(replacements)) {
        if (content.includes(key)) {
          content = content.replace(new RegExp(key, 'g'), value);
          changed = true;
        }
      }
      
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(directory);
console.log('Color reversion complete.');
