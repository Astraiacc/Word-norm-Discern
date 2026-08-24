const fs = require('fs');
const local = JSON.parse(fs.readFileSync('hanzi_local.json', 'utf8'));
const chars = Object.keys(local);
console.log('Downloading official data for', chars.length, 'characters...');

async function fetchChar(ch, tryUrl) {
    const res = await fetch(tryUrl);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
}

async function fetchWithRetry(ch) {
    const urls = [
        'https://unpkg.com/hanzi-writer-data@2.0.1/' + encodeURIComponent(ch) + '.json',
        'https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1/' + encodeURIComponent(ch) + '.json'
    ];
    for (let attempt = 0; attempt < 3; attempt++) {
        for (const url of urls) {
            try {
                return await fetchChar(ch, url);
            } catch (e) { /* try next */ }
        }
    }
    throw new Error('all retries failed for ' + ch);
}

(async () => {
    const result = {};
    let ok = 0, fail = [], mismatch = 0;
    const batchSize = 12;
    for (let i = 0; i < chars.length; i += batchSize) {
        const batch = chars.slice(i, i + batchSize);
        await Promise.all(batch.map(async ch => {
            try {
                const official = await fetchWithRetry(ch);
                // 校验：笔画数一致 & 路径一致（官方数据优先，保证顺序正确）
                if (official.strokes && official.strokes.length === (local[ch].strokes || []).length) {
                    const same = official.strokes.every((s, idx) => s === local[ch].strokes[idx]);
                    if (!same) mismatch++;
                    result[ch] = { strokes: official.strokes, medians: official.medians };
                } else {
                    // 笔画数不一致（不太可能），仍用官方完整数据
                    result[ch] = { strokes: official.strokes, medians: official.medians };
                    mismatch++;
                }
                ok++;
            } catch (e) {
                fail.push(ch);
            }
        }));
        process.stdout.write('\rProgress: ' + Math.min(i + batchSize, chars.length) + '/' + chars.length);
    }
    console.log('\nDownloaded OK:', ok, '| Failed:', fail.length, '| stroke diffs:', mismatch);
    if (fail.length) console.log('Failed chars:', fail.join(' '));
    fs.writeFileSync('hanzi_official.json', JSON.stringify(result));
    console.log('Saved to hanzi_official.json, size:', (fs.statSync('hanzi_official.json').size / 1024).toFixed(1), 'KB');
})();
