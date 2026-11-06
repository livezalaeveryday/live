const fs = require('fs');
const path = require('path');

const targetFlavor = process.argv[2];
if (!targetFlavor || !['direct', 'play'].includes(targetFlavor)) {
  console.error('Usage: node scripts/set-flavor.js <direct|play>');
  process.exit(1);
}

const flavorFilePath = path.join(__dirname, '..', 'src', 'config', 'flavor.ts');
let content = fs.readFileSync(flavorFilePath, 'utf8');

const regex = /export const DEFAULT_FLAVOR: BuildFlavor = '(direct|play)';/;
if (!regex.test(content)) {
  console.error('Could not find DEFAULT_FLAVOR in src/config/flavor.ts');
  process.exit(1);
}

content = content.replace(regex, `export const DEFAULT_FLAVOR: BuildFlavor = '${targetFlavor}';`);
fs.writeFileSync(flavorFilePath, content, 'utf8');
console.log(`[Flavor Switcher] Successfully set DEFAULT_FLAVOR to: ${targetFlavor}`);
