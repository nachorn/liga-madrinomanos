const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const files = ['index.html', 'styles.css', 'app.js', 'manifest.json', 'service-worker.js', 'icon.svg', 'logo.svg.png'];

files.forEach((file) => {
  const src = path.join(root, file);
  const dest = path.join(__dirname, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log('Copied', file);
  }
});
