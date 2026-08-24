const fs = require('fs');
const official = JSON.parse(fs.readFileSync('hanzi_official.json', 'utf8'));

let html = fs.readFileSync('网络用语辨析.html', 'utf8');
console.log('Original file size:', (html.length / 1024).toFixed(1), 'KB');

// 1. 替换 HANZI_DATA（含真 medians）
const startMarker = '<script>window.HANZI_DATA=';
const endMarker = ';</script>';
const startIdx = html.indexOf(startMarker);
if (startIdx === -1) { console.log('ERROR: HANZI_DATA script tag not found'); process.exit(1); }
const dataStart = startIdx + startMarker.length;
const endIdx = html.indexOf(endMarker, dataStart);
if (endIdx === -1) { console.log('ERROR: HANZI_DATA end not found'); process.exit(1); }
const newTag = '<script>window.HANZI_DATA=' + JSON.stringify(official) + ';</script>';
html = html.slice(0, startIdx) + newTag + html.slice(endIdx + endMarker.length);

// 2. 加快动画速度（活动代码+注释副本都替换）：笔画速度 0.55 -> 2，笔画间隔 420ms -> 200ms
const oldSpeed = 'strokeAnimationSpeed: 0.55, delayBetweenStrokes: 420,';
const newSpeed = 'strokeAnimationSpeed: 2, delayBetweenStrokes: 200,';
let count = html.split(oldSpeed).length - 1;
console.log('Speed config occurrences replaced:', count);
html = html.split(oldSpeed).join(newSpeed);

fs.writeFileSync('网络用语辨析.html', html);
console.log('New file size:', (fs.statSync('网络用语辨析.html').size / 1024).toFixed(1), 'KB');
console.log('Done.');
