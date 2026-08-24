const fs = require('fs');
const html = fs.readFileSync('网络用语辨析.html', 'utf8');
const m = html.match(/window\.HANZI_DATA\s*=\s*(\{[\s\S]*?\});\s*<\/script>/);
if (!m) { console.log('HANZI_DATA not found'); process.exit(1); }
const data = JSON.parse(m[1]);
console.log('Total chars in HANZI_DATA:', Object.keys(data).length);
console.log('Has 真:', !!data['真'], '| strokes count:', data['真'] ? data['真'].strokes.length : 0);
console.log('Has 的:', !!data['的'], '| strokes count:', data['的'] ? data['的'].strokes.length : 0);
console.log('Has 假:', !!data['假'], '| strokes count:', data['假'] ? data['假'].strokes.length : 0);
console.log('Has 尊:', !!data['尊'], '| Has 嘟:', !!data['嘟']);
fs.writeFileSync('hanzi_local.json', JSON.stringify(data));
console.log('Saved local data to hanzi_local.json');
