import fs from 'fs';
import path from 'path';

const directory = './src';

const replacements = {
  '#ff9600': '#2563eb', // primary
  '#FF9600': '#2563eb',
  '#ffb44d': '#60a5fa', // light
  '#FFB44D': '#60a5fa',
  '#cc7800': '#1d4ed8', // dark
  '#CC7800': '#1d4ed8'
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
console.log('Color replacement complete.');
