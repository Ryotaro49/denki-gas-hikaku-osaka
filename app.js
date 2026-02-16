'use strict';

// ===== 電力会社データ（関西エリア） =====
// 料金は基準単位料金（税込）。燃料費調整額・再エネ賦課金は含まない。
const ELECTRICITY_PROVIDERS = [
    {
        id: 'kepco',
        name: '関西電力',
        plan: '従量電灯A',
        color: '#D32F2F',
        source: 'https://kepco.jp/ryokin/unitprice/',
        rates: [
            { label: '最低料金（〜15kWh）', value: '522.58円' },
            { label: '15〜120kWh', value: '20.21円/kWh' },
            { label: '120〜300kWh', value: '25.61円/kWh' },
            { label: '300kWh〜', value: '28.59円/kWh' }
        ],
        calculate(kwh) {
            if (kwh <= 15) return 522.58;
            let cost = 522.58;
            cost += Math.min(Math.max(kwh - 15, 0), 105) * 20.21;
            cost += Math.min(Math.max(kwh - 120, 0), 180) * 25.61;
            cost += Math.max(kwh - 300, 0) * 28.59;
            return cost;
        }
    },
    {
        id: 'osakagas_elec',
        name: '大阪ガスの電気',
        plan: 'ベースプランA-G / A',
        color: '#1565C0',
        source: 'https://home.osakagas.co.jp/energy/electricity/price/plan_ag/',
        note: 'A-Gプランは大阪ガスのガス契約が必要。他社ガスの場合はベースプランA（やや割高）が適用。',
        rates: [
            { label: '最低料金（〜15kWh）', value: '466.57円' },
            { label: '15〜120kWh', value: '20.21円/kWh' },
            { label: '120〜350kWh（A-G）', value: '24.80円/kWh' },
            { label: '120〜350kWh（A）', value: '25.20円/kWh' },
            { label: '350kWh〜（A-G）', value: '27.72円/kWh' },
            { label: '350kWh〜（A）', value: '28.01円/kWh' }
        ],
        // gasId を受け取り、大阪ガスとのセットかどうかで料金を切り替え
        calculate(kwh, gasId) {
            const isGasSet = gasId === 'osakagas';
            if (kwh <= 15) return 466.57;
            let cost = 466.57;
            cost += Math.min(Math.max(kwh - 15, 0), 105) * 20.21;
            if (isGasSet) {
                cost += Math.min(Math.max(kwh - 120, 0), 230) * 24.80;
                cost += Math.max(kwh - 350, 0) * 27.72;
            } else {
                cost += Math.min(Math.max(kwh - 120, 0), 230) * 25.20;
                cost += Math.max(kwh - 350, 0) * 28.01;
            }
            return cost;
        }
    },
    {
        id: 'octopus_elec',
        name: 'オクトパスエナジー',
        plan: 'グリーンオクトパス',
        color: '#7B1FA2',
        source: 'https://octopusenergy.co.jp/tariffs',
        rates: [
            { label: '基本料金', value: '12.40円/日（約372円/月）' },
            { label: '0〜15kWh', value: '0.00円（無料）' },
            { label: '16〜120kWh', value: '20.21円/kWh' },
            { label: '121〜300kWh', value: '23.81円/kWh' },
            { label: '301kWh〜', value: '26.61円/kWh' }
        ],
        calculate(kwh) {
            const baseCost = 12.40 * 30; // 基本料金（30日換算）
            if (kwh <= 15) return baseCost; // 15kWhまで無料
            let cost = baseCost;
            cost += Math.min(Math.max(kwh - 15, 0), 105) * 20.21;
            cost += Math.min(Math.max(kwh - 120, 0), 180) * 23.81;
            cost += Math.max(kwh - 300, 0) * 26.61;
            return cost;
        }
    },
    {
        id: 'au_elec',
        name: 'auでんき',
        plan: 'でんきMプラン',
        color: '#E65100',
        source: 'https://www.au.com/energy/denki/merit/plan/',
        note: '料金単価は関西電力と同等。Pontaポイント還元あり。',
        rates: [
            { label: '最低料金（〜15kWh）', value: '522.57円' },
            { label: '15〜120kWh', value: '20.20円/kWh' },
            { label: '120〜300kWh', value: '25.60円/kWh' },
            { label: '300kWh〜', value: '28.58円/kWh' },
            { label: 'Pontaポイント還元', value: '0.5%（8,000円以上は1%）' }
        ],
        calculate(kwh) {
            if (kwh <= 15) return 522.57;
            let cost = 522.57;
            cost += Math.min(Math.max(kwh - 15, 0), 105) * 20.20;
            cost += Math.min(Math.max(kwh - 120, 0), 180) * 25.60;
            cost += Math.max(kwh - 300, 0) * 28.58;
            // Pontaポイント還元（実質割引として概算）
            if (cost >= 8000) return cost * 0.99;
            return cost * 0.995;
        }
    },
    {
        id: 'rakuten_elec',
        name: '楽天でんき',
        plan: 'プランS',
        color: '#BF0000',
        source: 'https://energy.rakuten.co.jp/electricity/fee/plan_s/',
        note: '基本料金0円。楽天ポイント還元あり（200円につき1pt、楽天ガスセットで100円につき1pt）。',
        rates: [
            { label: '基本料金', value: '0円' },
            { label: '従量料金（一律）', value: '22.50円/kWh' }
        ],
        calculate(kwh) {
            return kwh * 22.50;
        }
    }
];

// ===== ガス会社データ（大阪ガスエリア） =====
// 料金体系: 基本料金 + 使用量 × 基準単位料金（使用量に応じた段階制）
// 原料費調整額は含まない。
const GAS_PROVIDERS = [
    {
        id: 'osakagas',
        name: '大阪ガス',
        plan: '一般料金',
        color: '#0277BD',
        source: 'https://home.osakagas.co.jp/energy/gas/general_rate/',
        rates: [
            { label: '0〜20m3', value: '基本759.00円 + 174.81円/m3' },
            { label: '20〜50m3', value: '基本1,364.81円 + 144.52円/m3' },
            { label: '50〜100m3', value: '基本1,635.74円 + 139.10円/m3' },
            { label: '100〜200m3', value: '基本2,074.72円 + 134.71円/m3' },
            { label: '200〜350m3', value: '基本3,506.75円 + 127.55円/m3' }
        ],
        calculate(m3) {
            if (m3 <= 0) return 0;
            if (m3 <= 20) return 759.00 + m3 * 174.81;
            if (m3 <= 50) return 1364.81 + m3 * 144.52;
            if (m3 <= 100) return 1635.74 + m3 * 139.10;
            if (m3 <= 200) return 2074.72 + m3 * 134.71;
            if (m3 <= 350) return 3506.75 + m3 * 127.55;
            return 3834.72 + m3 * 126.62;
        }
    },
    {
        id: 'kepco_gas',
        name: '関電ガス',
        plan: 'なっトクプラン',
        color: '#C62828',
        source: 'https://kepco.jp/gas/menu_nattoku/',
        note: '2025年12月改定料金。電気セット割引は廃止され料金に反映済み。',
        rates: [
            { label: '0〜20m3', value: '基本735.13円 + 154.00円/m3' },
            { label: '20〜50m3', value: '基本1,223.46円 + 129.65円/m3' },
            { label: '50〜100m3', value: '基本1,227.82円 + 129.52円/m3' },
            { label: '100〜200m3', value: '基本1,631.90円 + 125.45円/m3' },
            { label: '200〜350m3', value: '基本2,951.03円 + 118.84円/m3' }
        ],
        calculate(m3) {
            if (m3 <= 0) return 0;
            if (m3 <= 20) return 735.13 + m3 * 154.00;
            if (m3 <= 50) return 1223.46 + m3 * 129.65;
            if (m3 <= 100) return 1227.82 + m3 * 129.52;
            if (m3 <= 200) return 1631.90 + m3 * 125.45;
            if (m3 <= 350) return 2951.03 + m3 * 118.84;
            return 3251.86 + m3 * 117.96;
        }
    },
    {
        id: 'elpio_gas',
        name: 'エルピオ都市ガス',
        plan: 'スタンダードプラン',
        color: '#6A1B9A',
        source: 'https://www.lpio.jp/city_gas/city_plan/',
        rates: [
            { label: '0〜20m3', value: '基本720.29円 + 165.89円/m3' },
            { label: '20〜50m3', value: '基本1,295.20円 + 137.15円/m3' },
            { label: '50〜100m3', value: '基本1,568.67円 + 133.40円/m3' },
            { label: '100〜200m3', value: '基本1,989.66円 + 129.19円/m3' },
            { label: '200〜350m3', value: '基本3,398.04円 + 123.60円/m3' }
        ],
        calculate(m3) {
            if (m3 <= 0) return 0;
            if (m3 <= 20) return 720.29 + m3 * 165.89;
            if (m3 <= 50) return 1295.20 + m3 * 137.15;
            if (m3 <= 100) return 1568.67 + m3 * 133.40;
            if (m3 <= 200) return 1989.66 + m3 * 129.19;
            if (m3 <= 350) return 3398.04 + m3 * 123.60;
            return 3715.84 + m3 * 122.69;
        }
    },
    {
        id: 'gasone',
        name: 'ガスワン（サイサン）',
        plan: '都市ガスハッピープラン',
        color: '#00838F',
        source: 'https://www.gasone.net/toshi-gas/osakagas/',
        note: '大阪ガス一般料金から一律4%割引。エネワンでんきとのセット割（月220円引き）あり。',
        rates: [
            { label: '0〜20m3', value: '基本728.64円 + 167.81円/m3' },
            { label: '20〜50m3', value: '基本1,310.21円 + 138.73円/m3' },
            { label: '50〜100m3', value: '基本1,570.31円 + 133.53円/m3' },
            { label: '100〜200m3', value: '基本1,991.73円 + 129.32円/m3' },
            { label: '200〜350m3', value: '基本3,366.48円 + 122.44円/m3' }
        ],
        calculate(m3) {
            if (m3 <= 0) return 0;
            if (m3 <= 20) return 728.64 + m3 * 167.81;
            if (m3 <= 50) return 1310.21 + m3 * 138.73;
            if (m3 <= 100) return 1570.31 + m3 * 133.53;
            if (m3 <= 200) return 1991.73 + m3 * 129.32;
            if (m3 <= 350) return 3366.48 + m3 * 122.44;
            return 3681.33 + m3 * 121.55;
        }
    }
];

// ===== セット割引 =====
// 2025年12月以降:
// - 関電ガス なっトクパックの電気セット割引は廃止（料金に反映済み）
// - 大阪ガスの電気 A-G は大阪ガスのガス契約時の料金（calculate内で処理）
const SET_DISCOUNTS = [];

// ===== 世帯人数プリセット =====
const HOUSEHOLD_PRESETS = {
    1: { kwh: 170, m3: 17, label: '1人暮らし平均' },
    2: { kwh: 250, m3: 28, label: '2人暮らし平均' },
    3: { kwh: 310, m3: 33, label: '3人暮らし平均' },
    4: { kwh: 370, m3: 39, label: '4人以上平均' }
};

// ===== DOM要素 =====
const kwhSlider = document.getElementById('kwh-slider');
const kwhInput = document.getElementById('kwh-input');
const m3Slider = document.getElementById('m3-slider');
const m3Input = document.getElementById('m3-input');
const bestCard = document.getElementById('best-card');
const tableBody = document.querySelector('#results-table tbody');

// ===== チャートインスタンス =====
let combinationChart = null;
let electricityChart = null;
let gasChart = null;
let annualChart = null;

// ===== ユーティリティ =====
function formatYen(num) {
    return Math.round(num).toLocaleString('ja-JP');
}

// ===== 全組み合わせを計算 =====
function calculateCombinations(kwh, m3) {
    const results = [];

    for (const elec of ELECTRICITY_PROVIDERS) {
        for (const gas of GAS_PROVIDERS) {
            // 大阪ガスの電気は gasId を渡して A-G / A を切り替え
            const elecCost = elec.calculate(kwh, gas.id);
            const gasCost = gas.calculate(m3);

            // 大阪ガスの電気 + 大阪ガスの場合のプラン表示
            let elecPlanLabel = elec.plan;
            let comboNote = '';
            if (elec.id === 'osakagas_elec') {
                if (gas.id === 'osakagas') {
                    elecPlanLabel = 'ベースプランA-G';
                } else {
                    elecPlanLabel = 'ベースプランA';
                }
            }
            if (elec.note) {
                comboNote = elec.note;
            }

            results.push({
                elec,
                gas,
                elecPlanLabel,
                elecCost,
                gasCost,
                comboNote,
                discount: null,
                total: elecCost + gasCost
            });
        }
    }

    results.sort((a, b) => a.total - b.total);
    return results;
}

// ===== 最安カード描画 =====
function renderBestCard(combinations) {
    const best = combinations[0];
    const worst = combinations[combinations.length - 1];
    const annualSaving = (worst.total - best.total) * 12;

    bestCard.innerHTML = `
        <div class="best-badge">最安</div>
        <div class="best-providers">
            <span class="best-provider-tag" style="background:${best.elec.color}">
                ${best.elec.name}
            </span>
            <span class="best-plus">+</span>
            <span class="best-provider-tag" style="background:${best.gas.color}">
                ${best.gas.name}
            </span>
        </div>
        <div class="best-price-row">
            <div class="best-total">
                ${formatYen(best.total)}<span class="yen">円 / 月</span>
            </div>
            <div class="best-breakdown">
                （電気：${formatYen(best.elecCost)}円 ＋ ガス：${formatYen(best.gasCost)}円）
            </div>
        </div>
        ${annualSaving > 0 ? `
            <div class="best-savings">
                最も高い組み合わせと比べて年間 ${formatYen(annualSaving)}円 おトク
            </div>
        ` : ''}
    `;
}

// ===== 全組み合わせチャート =====
function renderCombinationChart(combinations) {
    const ctx = document.getElementById('combination-chart').getContext('2d');

    const labels = combinations.map(c =>
        `${c.elec.name} × ${c.gas.name}`
    );
    const elecData = combinations.map(c => Math.round(c.elecCost));
    const gasData = combinations.map(c => Math.round(c.gasCost));
    const bgElec = combinations.map(c => c.elec.color + 'CC');
    const bgGas = combinations.map(c => c.gas.color + 'CC');

    if (combinationChart) combinationChart.destroy();

    combinationChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    label: '電気代',
                    data: elecData,
                    backgroundColor: bgElec,
                    borderRadius: { topLeft: 0, bottomLeft: 4, topRight: 0, bottomRight: 4 }
                },
                {
                    label: 'ガス代',
                    data: gasData,
                    backgroundColor: bgGas,
                    borderRadius: { topLeft: 4, bottomLeft: 0, topRight: 4, bottomRight: 0 }
                }
            ]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: { font: { family: "'Noto Sans JP', sans-serif", size: 13 } }
                },
                tooltip: {
                    callbacks: {
                        label(ctx) {
                            return `${ctx.dataset.label}：${ctx.raw.toLocaleString()}円`;
                        },
                        afterBody(items) {
                            const idx = items[0].dataIndex;
                            const total = elecData[idx] + gasData[idx];
                            return `合計：${total.toLocaleString()}円`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    title: { display: true, text: '月額料金（円）' },
                    ticks: {
                        callback: v => v.toLocaleString()
                    }
                },
                y: {
                    stacked: true,
                    ticks: {
                        font: { size: 11, family: "'Noto Sans JP', sans-serif" }
                    }
                }
            }
        }
    });
}

// ===== 電気料金チャート =====
function renderElectricityChart(kwh) {
    const ctx = document.getElementById('electricity-chart').getContext('2d');
    // 電気単体比較では gasId なし（大阪ガスの電気はベースプランAで計算）
    const data = ELECTRICITY_PROVIDERS.map(p => ({
        name: p.name,
        cost: Math.round(p.calculate(kwh, null)),
        color: p.color
    }));
    data.sort((a, b) => a.cost - b.cost);

    if (electricityChart) electricityChart.destroy();

    electricityChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d.name),
            datasets: [{
                data: data.map(d => d.cost),
                backgroundColor: data.map(d => d.color + 'CC'),
                borderColor: data.map(d => d.color),
                borderWidth: 1,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => `${ctx.raw.toLocaleString()}円/月`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: { display: true, text: '円/月' },
                    ticks: { callback: v => v.toLocaleString() }
                }
            }
        }
    });
}

// ===== ガス料金チャート =====
function renderGasChart(m3) {
    const ctx = document.getElementById('gas-chart').getContext('2d');
    const data = GAS_PROVIDERS.map(p => ({
        name: p.name,
        cost: Math.round(p.calculate(m3)),
        color: p.color
    }));
    data.sort((a, b) => a.cost - b.cost);

    if (gasChart) gasChart.destroy();

    gasChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d.name),
            datasets: [{
                data: data.map(d => d.cost),
                backgroundColor: data.map(d => d.color + 'CC'),
                borderColor: data.map(d => d.color),
                borderWidth: 1,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => `${ctx.raw.toLocaleString()}円/月`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: { display: true, text: '円/月' },
                    ticks: { callback: v => v.toLocaleString() }
                }
            }
        }
    });
}

// ===== 年間コストチャート（上位5件） =====
function renderAnnualChart(combinations) {
    const ctx = document.getElementById('annual-chart').getContext('2d');
    const top5 = combinations.slice(0, 5);
    const labels = top5.map(c => `${c.elec.name} × ${c.gas.name}`);
    const annualData = top5.map(c => Math.round(c.total * 12));

    const colors = top5.map((c, i) =>
        i === 0 ? '#FF6F00' : '#90A4AE'
    );

    if (annualChart) annualChart.destroy();

    annualChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: '年間コスト',
                data: annualData,
                backgroundColor: colors.map(c => c + 'CC'),
                borderColor: colors,
                borderWidth: 1,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => `年間：${ctx.raw.toLocaleString()}円`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: { display: true, text: '年額（円）' },
                    ticks: { callback: v => v.toLocaleString() }
                }
            }
        }
    });
}

// ===== テーブル描画 =====
function renderTable(combinations) {
    tableBody.innerHTML = combinations.map((c, i) => {
        const rank = i + 1;
        const rankClass = rank <= 3 ? `rank-${rank}` : '';

        return `
            <tr class="${rankClass}">
                <td><span class="rank-badge">${rank}</span></td>
                <td>${c.elec.name}<br><small style="color:#888">${c.elecPlanLabel}</small></td>
                <td>${c.gas.name}<br><small style="color:#888">${c.gas.plan}</small></td>
                <td>${formatYen(c.elecCost)}円</td>
                <td>${formatYen(c.gasCost)}円</td>
                <td><strong>${formatYen(c.total)}円</strong></td>
                <td>${formatYen(c.total * 12)}円</td>
            </tr>
        `;
    }).join('');
}

// ===== 料金ソース描画 =====
function renderSources() {
    const container = document.getElementById('sources-container');
    if (!container) return;

    let html = '';

    html += '<h3>電力会社</h3><div class="source-grid">';
    for (const p of ELECTRICITY_PROVIDERS) {
        html += `
            <div class="source-card">
                <div class="source-header" style="border-left: 4px solid ${p.color}">
                    <strong>${p.name}</strong>
                    <span class="source-plan">${p.plan}</span>
                </div>
                <table class="rate-table">
                    <tbody>
                        ${p.rates.map(r => `
                            <tr><td>${r.label}</td><td>${r.value}</td></tr>
                        `).join('')}
                    </tbody>
                </table>
                ${p.note ? `<p class="source-note">${p.note}</p>` : ''}
                <a href="${p.source}" target="_blank" rel="noopener noreferrer" class="source-link">
                    公式サイトで確認
                </a>
            </div>
        `;
    }
    html += '</div>';

    html += '<h3>ガス会社</h3><div class="source-grid">';
    for (const p of GAS_PROVIDERS) {
        html += `
            <div class="source-card">
                <div class="source-header" style="border-left: 4px solid ${p.color}">
                    <strong>${p.name}</strong>
                    <span class="source-plan">${p.plan}</span>
                </div>
                <table class="rate-table">
                    <tbody>
                        ${p.rates.map(r => `
                            <tr><td>${r.label}</td><td>${r.value}</td></tr>
                        `).join('')}
                    </tbody>
                </table>
                ${p.note ? `<p class="source-note">${p.note}</p>` : ''}
                <a href="${p.source}" target="_blank" rel="noopener noreferrer" class="source-link">
                    公式サイトで確認
                </a>
            </div>
        `;
    }
    html += '</div>';

    container.innerHTML = html;
}

// ===== メイン計算・描画 =====
function calculate() {
    const kwh = parseInt(kwhInput.value) || 0;
    const m3 = parseInt(m3Input.value) || 0;

    const combinations = calculateCombinations(kwh, m3);

    renderBestCard(combinations);
    renderCombinationChart(combinations);
    renderElectricityChart(kwh);
    renderGasChart(m3);
    renderAnnualChart(combinations);
    renderTable(combinations);
}

// ===== イベントリスナー =====

// スライダーと入力の同期
kwhSlider.addEventListener('input', () => {
    kwhInput.value = kwhSlider.value;
    calculate();
});
kwhInput.addEventListener('input', () => {
    kwhSlider.value = Math.min(kwhInput.value, 800);
    calculate();
});
m3Slider.addEventListener('input', () => {
    m3Input.value = m3Slider.value;
    calculate();
});
m3Input.addEventListener('input', () => {
    m3Slider.value = Math.min(m3Input.value, 150);
    calculate();
});

// 世帯人数プリセット
document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const persons = parseInt(btn.dataset.persons);
        const preset = HOUSEHOLD_PRESETS[persons];
        kwhInput.value = preset.kwh;
        kwhSlider.value = preset.kwh;
        m3Input.value = preset.m3;
        m3Slider.value = preset.m3;
        calculate();
    });
});

// ===== 初期描画 =====
renderSources();
calculate();
