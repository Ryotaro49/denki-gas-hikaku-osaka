'use strict';

// ===== 電力会社データ（関西エリア） =====
const ELECTRICITY_PROVIDERS = [
    {
        id: 'kepco',
        name: '関西電力',
        plan: '従量電灯A',
        color: '#D32F2F',
        source: 'https://kepco.jp/ryokin/menu/juuryou_a/',
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
        plan: 'ベースプランA-G',
        color: '#1565C0',
        source: 'https://ene.osakagas.co.jp/electricity/menu/menu_base.html',
        rates: [
            { label: '最低料金（〜15kWh）', value: '522.58円' },
            { label: '15〜120kWh', value: '20.21円/kWh' },
            { label: '120〜300kWh', value: '24.80円/kWh' },
            { label: '300kWh〜', value: '27.72円/kWh' }
        ],
        calculate(kwh) {
            if (kwh <= 15) return 522.58;
            let cost = 522.58;
            cost += Math.min(Math.max(kwh - 15, 0), 105) * 20.21;
            cost += Math.min(Math.max(kwh - 120, 0), 180) * 24.80;
            cost += Math.max(kwh - 300, 0) * 27.72;
            return cost;
        }
    },
    {
        id: 'au_elec',
        name: 'auでんき',
        plan: 'でんきMプラン',
        color: '#E65100',
        source: 'https://www.au.com/electricity/charge/m-plan/',
        rates: [
            { label: '最低料金（〜15kWh）', value: '522.58円' },
            { label: '15〜120kWh', value: '20.21円/kWh' },
            { label: '120〜300kWh', value: '25.61円/kWh' },
            { label: '300kWh〜', value: '28.59円/kWh' },
            { label: 'Pontaポイント還元', value: '1〜5%相当' }
        ],
        calculate(kwh) {
            // 基本料金は関西電力と同等
            if (kwh <= 15) return 522.58;
            let cost = 522.58;
            cost += Math.min(Math.max(kwh - 15, 0), 105) * 20.21;
            cost += Math.min(Math.max(kwh - 120, 0), 180) * 25.61;
            cost += Math.max(kwh - 300, 0) * 28.59;
            // Pontaポイント還元（実質割引として概算）
            if (cost >= 8000) return cost * 0.95;
            if (cost >= 5000) return cost * 0.97;
            return cost * 0.99;
        }
    },
    {
        id: 'eo_elec',
        name: 'eo電気',
        plan: 'スタンダードプラン',
        color: '#2E7D32',
        source: 'https://eonet.jp/denki/standard/',
        rates: [
            { label: '最低料金（〜15kWh）', value: '522.58円' },
            { label: '15〜120kWh', value: '20.21円/kWh' },
            { label: '120〜300kWh', value: '25.01円/kWh' },
            { label: '300kWh〜', value: '27.51円/kWh' }
        ],
        calculate(kwh) {
            if (kwh <= 15) return 522.58;
            let cost = 522.58;
            cost += Math.min(Math.max(kwh - 15, 0), 105) * 20.21;
            cost += Math.min(Math.max(kwh - 120, 0), 180) * 25.01;
            cost += Math.max(kwh - 300, 0) * 27.51;
            return cost;
        }
    }
];

// ===== ガス会社データ（大阪ガスエリア） =====
// 料金体系: 基本料金 + 使用量 × 従量単価（使用量に応じた段階制）
const GAS_PROVIDERS = [
    {
        id: 'osakagas',
        name: '大阪ガス',
        plan: '一般料金',
        color: '#0277BD',
        source: 'https://home.osakagas.co.jp/price/menu/general_rate.html',
        rates: [
            { label: '0〜20m3', value: '基本759.00円 + 174.81円/m3' },
            { label: '20〜50m3', value: '基本1,364.81円 + 144.52円/m3' },
            { label: '50〜100m3', value: '基本1,635.74円 + 139.10円/m3' },
            { label: '100〜250m3', value: '基本2,074.72円 + 134.71円/m3' }
        ],
        calculate(m3) {
            if (m3 <= 0) return 0;
            if (m3 <= 20) return 759.00 + m3 * 174.81;
            if (m3 <= 50) return 1364.81 + m3 * 144.52;
            if (m3 <= 100) return 1635.74 + m3 * 139.10;
            if (m3 <= 250) return 2074.72 + m3 * 134.71;
            return 2667.42 + m3 * 128.78;
        }
    },
    {
        id: 'kepco_gas',
        name: '関電ガス',
        plan: 'なっトクプラン',
        color: '#C62828',
        source: 'https://kepco.jp/gas/plan/nattoku/',
        rates: [
            { label: '0〜20m3', value: '基本758.90円 + 158.77円/m3' },
            { label: '20〜50m3', value: '基本1,262.33円 + 133.66円/m3' },
            { label: '50〜100m3', value: '基本1,266.83円 + 133.57円/m3' },
            { label: '100〜250m3', value: '基本1,683.41円 + 129.40円/m3' }
        ],
        calculate(m3) {
            if (m3 <= 0) return 0;
            if (m3 <= 20) return 758.90 + m3 * 158.77;
            if (m3 <= 50) return 1262.33 + m3 * 133.66;
            if (m3 <= 100) return 1266.83 + m3 * 133.57;
            if (m3 <= 250) return 1683.41 + m3 * 129.40;
            return 2642.85 + m3 * 125.56;
        }
    },
    {
        id: 'elpio_gas',
        name: 'エルピオ都市ガス',
        plan: 'スタンダードプラン',
        color: '#6A1B9A',
        source: 'https://lpio.jp/gas/',
        rates: [
            { label: '0〜20m3', value: '基本758.90円 + 158.70円/m3' },
            { label: '20〜50m3', value: '基本1,262.33円 + 133.53円/m3' },
            { label: '50〜100m3', value: '基本1,266.83円 + 133.44円/m3' },
            { label: '100〜250m3', value: '基本1,683.41円 + 129.27円/m3' }
        ],
        calculate(m3) {
            if (m3 <= 0) return 0;
            if (m3 <= 20) return 758.90 + m3 * 158.70;
            if (m3 <= 50) return 1262.33 + m3 * 133.53;
            if (m3 <= 100) return 1266.83 + m3 * 133.44;
            if (m3 <= 250) return 1683.41 + m3 * 129.27;
            return 2642.85 + m3 * 125.43;
        }
    }
];

// ===== セット割引 =====
const SET_DISCOUNTS = [
    {
        elecId: 'osakagas_elec',
        gasId: 'osakagas',
        name: '大阪ガス セット割',
        description: '電気代から3%割引',
        apply(elecCost, gasCost) {
            return { elec: elecCost * 0.97, gas: gasCost };
        }
    },
    {
        elecId: 'kepco',
        gasId: 'kepco_gas',
        name: 'なっトクパック',
        description: 'ガス代から3%割引',
        apply(elecCost, gasCost) {
            return { elec: elecCost, gas: gasCost * 0.97 };
        }
    }
];

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
            let elecCost = elec.calculate(kwh);
            let gasCost = gas.calculate(m3);
            let discount = null;

            // セット割引を確認
            const setDiscount = SET_DISCOUNTS.find(
                d => d.elecId === elec.id && d.gasId === gas.id
            );

            if (setDiscount) {
                const applied = setDiscount.apply(elecCost, gasCost);
                discount = {
                    name: setDiscount.name,
                    description: setDiscount.description,
                    amount: (elecCost + gasCost) - (applied.elec + applied.gas)
                };
                elecCost = applied.elec;
                gasCost = applied.gas;
            }

            results.push({
                elec: elec,
                gas: gas,
                elecCost,
                gasCost,
                discount,
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

    let discountHtml = '';
    if (best.discount) {
        discountHtml = `
            <span class="set-discount-tag" style="margin-left:12px;">
                ${best.discount.name}：-${formatYen(best.discount.amount)}円/月
            </span>`;
    }

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
            ${discountHtml}
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
    const data = ELECTRICITY_PROVIDERS.map(p => ({
        name: p.name,
        cost: Math.round(p.calculate(kwh)),
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

        const discountCell = c.discount
            ? `<span class="set-discount-tag">${c.discount.name}<br>-${formatYen(c.discount.amount)}円</span>`
            : `<span class="no-discount">-</span>`;

        return `
            <tr class="${rankClass}">
                <td><span class="rank-badge">${rank}</span></td>
                <td>${c.elec.name}<br><small style="color:#888">${c.elec.plan}</small></td>
                <td>${c.gas.name}<br><small style="color:#888">${c.gas.plan}</small></td>
                <td>${formatYen(c.elecCost)}円</td>
                <td>${formatYen(c.gasCost)}円</td>
                <td>${discountCell}</td>
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
                <a href="${p.source}" target="_blank" rel="noopener noreferrer" class="source-link">
                    公式サイトで確認
                </a>
            </div>
        `;
    }
    html += '</div>';

    html += '<h3>セット割引</h3><div class="source-grid">';
    for (const d of SET_DISCOUNTS) {
        const elec = ELECTRICITY_PROVIDERS.find(p => p.id === d.elecId);
        const gas = GAS_PROVIDERS.find(p => p.id === d.gasId);
        html += `
            <div class="source-card">
                <div class="source-header" style="border-left: 4px solid #FF6F00">
                    <strong>${d.name}</strong>
                </div>
                <p class="source-detail">${elec.name} + ${gas.name} で ${d.description}</p>
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
