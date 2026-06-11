const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'routes');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));

files.forEach(file => {
  const filepath = path.join(dir, file);
  let content = fs.readFileSync(filepath, 'utf8');

  // Convert queries to await
  content = content.replace(/(?<!await\s)queryOne\(/g, 'await queryOne(');
  content = content.replace(/(?<!await\s)queryAll\(/g, 'await queryAll(');
  content = content.replace(/(?<!await\s)runQuery\(/g, 'await runQuery(');

  // Convert arrow functions for router methods to async
  // Match router.get('/path', (req, res) => {
  content = content.replace(/router\.(get|post|put|delete)\((['"`].+?['"`]),\s*(?!\s*async\s*)\s*\((req|err, req), res/g, "router.$1($2, async ($3, res");
  // Match router.get('/path', middleware, (req, res) => {
  content = content.replace(/router\.(get|post|put|delete)\((['"`].+?['"`]),\s*([a-zA-Z0-9_]+),\s*(?!\s*async\s*)\s*\((req|err, req), res/g, "router.$1($2, $3, async ($4, res");

  // Fix forEach that now contain awaits
  content = content.replace(/pets\.forEach\(pet => \{/g, 'for (let pet of pets) {');
  content = content.replace(/chats\.forEach\(chat => \{/g, 'for (let chat of chats) {');
  // the closing brace for these forEach loops is a bit tricky, it ends with `});`
  // let's do a simple replace of `});` to `}` for those specific files
  if (file === 'pets.js') {
    content = content.replace(/      \}\);\n    \}\n\n    res/g, '      }\n    }\n\n    res');
  }
  if (file === 'chats.js') {
    content = content.replace(/      \}\n    \}\);\n\n    res/g, '      }\n    }\n\n    res');
  }

  fs.writeFileSync(filepath, content);
  console.log(`Refactored ${file}`);
});
