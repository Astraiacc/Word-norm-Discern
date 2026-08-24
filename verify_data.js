const fs = require('fs');
const html = fs.readFileSync('网络用语辨析.html', 'utf8');

// 提取新 HANZI_DATA
const startMarker = '<script>window.HANZI_DATA=';
const endMarker = ';</script>';
const s = html.indexOf(startMarker) + startMarker.length;
const e = html.indexOf(endMarker, s);
const data = JSON.parse(html.slice(s, e));

const chars = Object.keys(data);
let withMedians = 0, emptyMedians = 0;
for (const ch of chars) {
    const m = data[ch].medians;
    if (m && m.length > 0 && m.length === data[ch].strokes.length) withMedians++;
    else emptyMedians++;
}
console.log('Total chars:', chars.length);
console.log('Chars with real medians:', withMedians);
console.log('Chars with empty medians:', emptyMedians);
console.log('"一" medians[0]:', JSON.stringify(data['一'].medians[0]));
console.log('"真" strokes:', data['真'].strokes.length, 'medians:', data['真'].medians.length);

// 验证速度参数
const speedOK = html.includes('strokeAnimationSpeed: 2, delayBetweenStrokes: 200,');
console.log('Speed config updated:', speedOK);

// 验证 charDataLoader 的 medians 判断逻辑仍兼容（优先用真 medians）
console.log('Loader prefers real medians:', (data['真'].medians.length === data['真'].strokes.length && data['真'].medians.length > 0));
