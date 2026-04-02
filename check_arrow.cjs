const fs = require('fs');
const path = require('path');
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.git') && !file.includes('dist')) {
        results = results.concat(walk(file));
      }
    } else {
      if (file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}
const files = walk('./src');
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  if (content.includes('ArrowRight')) {
    const importMatch = content.match(/import\s*\{[^}]*ArrowRight[^}]*\}\s*from\s*['"]lucide-react['"]/m);
    if (!importMatch) {
      console.log('POSSIBLE MISSING IMPORT IN:', f);
    }
  }
});
console.log('Done');
