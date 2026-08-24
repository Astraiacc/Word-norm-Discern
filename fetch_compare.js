const fs = require('fs');
const local = JSON.parse(fs.readFileSync('hanzi_local.json', 'utf8'));
const chars = ['真', '的', '假'];

(async () => {
  for (const ch of chars) {
    try {
      const res = await fetch('https://unpkg.com/hanzi-writer-data@2.0.1/' + encodeURIComponent(ch) + '.json');
      if (!res.ok) { console.log(ch, ': fetch failed', res.status); continue; }
      const official = await res.json();
      const L = local[ch].strokes;
      const O = official.strokes;
      console.log('=== ' + ch + ' === local strokes: ' + L.length + ', official strokes: ' + O.length);
      if (L.length !== O.length) {
        console.log('  STROKE COUNT MISMATCH!');
      }
      let exact = 0, reordered = 0;
      for (let i = 0; i < Math.min(L.length, O.length); i++) {
        if (L[i] === O[i]) exact++;
        else {
          // check if this stroke exists elsewhere in official (order issue)
          const found = O.indexOf(L[i]);
          reordered++;
          console.log('  stroke[' + i + '] differs. found in official at index: ' + found);
        }
      }
      console.log('  exact matches: ' + exact + '/' + L.length + (reordered ? ' <-- ORDER/CONTENT DIFFERS' : ' (PERFECT ORDER MATCH)'));
      // also compare medians count
      console.log('  official medians: ' + official.medians.length + ', local medians: ' + local[ch].medians.length);
    } catch (e) {
      console.log(ch, ': error', e.message);
    }
  }
})();
