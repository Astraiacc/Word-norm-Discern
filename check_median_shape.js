const fs = require('fs');
const local = JSON.parse(fs.readFileSync('hanzi_local.json', 'utf8'));

// 我当前实现的路径采样函数（与HTML中一致）
function strokePathsToMedians(strokes) {
    return strokes.map(path => {
        const points = [];
        let lastX = 0, lastY = 0;
        const tokens = String(path || '').match(/[MLQCZ][^MLQCZ]*/g) || [];
        for (const token of tokens) {
            const cmd = token[0];
            const nums = token.slice(1).trim().split(/[\s,]+/).map(parseFloat).filter(n => !isNaN(n));
            switch (cmd) {
                case 'M': case 'L':
                    if (nums.length >= 2) { points.push([nums[0], nums[1]]); lastX = nums[0]; lastY = nums[1]; }
                    break;
                case 'Q':
                    if (nums.length >= 4) {
                        const cx = nums[0], cy = nums[1], ex = nums[2], ey = nums[3];
                        for (let i = 1; i <= 8; i++) {
                            const t = i / 8, mt = 1 - t;
                            points.push([mt*mt*lastX + 2*mt*t*cx + t*t*ex, mt*mt*lastY + 2*mt*t*cy + t*t*ey]);
                        }
                        lastX = ex; lastY = ey;
                    }
                    break;
                case 'C':
                    if (nums.length >= 6) {
                        const [c1x,c1y,c2x,c2y,ex,ey] = nums;
                        for (let i = 1; i <= 12; i++) {
                            const t = i/12, mt = 1-t;
                            points.push([mt**3*lastX+3*mt*mt*t*c1x+3*mt*t*t*c2x+t**3*ex, mt**3*lastY+3*mt*mt*t*c1y+3*mt*t*t*c2y+t**3*ey]);
                        }
                        lastX = ex; lastY = ey;
                    }
                    break;
                case 'Z':
                    if (points.length > 0) points.push([points[0][0], points[0][1]]);
                    break;
            }
        }
        if (points.length === 0) points.push([0, 0]);
        return points;
    });
}

(async () => {
    const res = await fetch('https://unpkg.com/hanzi-writer-data@2.0.1/' + encodeURIComponent('一') + '.json');
    const official = await res.json();
    const myMed = strokePathsToMedians(local['一'].strokes)[0];
    console.log('=== "一" 官方 medians[0]（应是从左到右的中心线）===');
    console.log(JSON.stringify(official.medians[0]));
    console.log('\n=== "一" 我计算的 medians[0]（前12个点）===');
    console.log(JSON.stringify(myMed.slice(0, 12)));
    console.log('\n我计算的点数:', myMed.length, '| 官方点数:', official.medians[0].length);
    // 官方 median 的 x 走向
    const ox = official.medians[0].map(p => p[0]);
    console.log('官方 x 范围: [' + Math.min(...ox) + ', ' + Math.max(...ox) + ']，首尾:', official.medians[0][0], '->', official.medians[0][official.medians[0].length-1]);
    const myx = myMed.map(p => p[0]);
    console.log('我的 x 范围: [' + Math.min(...myx) + ', ' + Math.max(...myx) + ']，首尾:', myMed[0], '->', myMed[myMed.length-1]);
})();
