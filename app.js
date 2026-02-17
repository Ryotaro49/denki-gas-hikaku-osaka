'use strict';

// ===== 地域別データ =====

const REGIONS = {
    osaka: {
        name: '大阪',
        electricityLabel: '電力会社（関西エリア）',
        gasLabel: 'ガス会社（大阪ガスエリア）',
        electricity: [
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
                    const baseCost = 12.40 * 30;
                    if (kwh <= 15) return baseCost;
                    let cost = baseCost;
                    cost += Math.min(Math.max(kwh - 15, 0), 105) * 20.21;
                    cost += Math.min(Math.max(kwh - 120, 0), 180) * 23.81;
                    cost += Math.max(kwh - 300, 0) * 26.61;
                    return cost;
                }
            },
            {
                id: 'octopus_simple',
                name: 'オクトパスエナジー',
                plan: 'シンプルオクトパス',
                color: '#9C27B0',
                source: 'https://octopusenergy.co.jp/tariffs',
                note: '基本料金・燃料費調整額0円。1年後にグリーンオクトパスへ自動切替。',
                rates: [
                    { label: '基本料金', value: '0円' },
                    { label: '従量料金（一律）', value: '26.90円/kWh' }
                ],
                calculate(kwh) {
                    return kwh * 26.90;
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
        ],
        gas: [
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
        ],
        notes: [
            '料金は概算の参考値です。燃料費調整額・再エネ賦課金は含まれていません。',
            '実際の料金は時期や使用状況により異なります。契約前に各社の公式サイトをご確認ください。',
            'オクトパスエナジーのグリーンオクトパスは燃料費調整額の上限がありません。市場価格により変動幅が大きい場合があります。',
            'シンプルオクトパスは基本料金・燃料費調整額0円のプランです。1年後にグリーンオクトパスへ自動切替されます。',
            'auでんきのPontaポイント還元は実質割引として概算計算しています。',
            '楽天でんきのポイント還元は計算に含まれていません。楽天経済圏での実質還元を考慮するとさらにお得になります。',
            'ガスワン（サイサン）のエネワンでんきセット割（月220円引き）は計算に含まれていません。',
            'セット割引は代表的なものを掲載しています。他にも割引がある場合があります。'
        ]
    },
    tokyo: {
        name: '東京',
        electricityLabel: '電力会社（東京エリア）',
        gasLabel: 'ガス会社（東京ガスエリア）',
        electricity: [
            {
                id: 'tepco',
                name: '東京電力EP',
                plan: '従量電灯B（30A）',
                color: '#F57C00',
                source: 'https://www.tepco.co.jp/ep/private/plan/old01.html',
                rates: [
                    { label: '基本料金（30A）', value: '935.25円/月' },
                    { label: '〜120kWh', value: '29.80円/kWh' },
                    { label: '120〜300kWh', value: '36.40円/kWh' },
                    { label: '300kWh〜', value: '40.49円/kWh' }
                ],
                calculate(kwh) {
                    let cost = 935.25;
                    cost += Math.min(kwh, 120) * 29.80;
                    cost += Math.min(Math.max(kwh - 120, 0), 180) * 36.40;
                    cost += Math.max(kwh - 300, 0) * 40.49;
                    return cost;
                }
            },
            {
                id: 'tokyogas_elec',
                name: '東京ガスの電気',
                plan: '基本プラン（30A）',
                color: '#1565C0',
                source: 'https://home.tokyo-gas.co.jp/gas_power/plan/power/price.html',
                note: '東京ガスのガス契約とのセット割（0.5%割引）あり。',
                rates: [
                    { label: '基本料金（30A）', value: '935.22円/月' },
                    { label: '〜120kWh', value: '29.70円/kWh' },
                    { label: '120〜300kWh', value: '35.69円/kWh' },
                    { label: '300kWh〜', value: '39.50円/kWh' }
                ],
                calculate(kwh, gasId) {
                    let cost = 935.22;
                    cost += Math.min(kwh, 120) * 29.70;
                    cost += Math.min(Math.max(kwh - 120, 0), 180) * 35.69;
                    cost += Math.max(kwh - 300, 0) * 39.50;
                    // 東京ガスとのセット割（0.5%割引）
                    if (gasId === 'tokyogas') {
                        cost *= 0.995;
                    }
                    return cost;
                }
            },
            {
                id: 'cdenergy_elec',
                name: 'CDエナジーダイレクト',
                plan: 'ベーシックでんきB（30A）',
                color: '#00897B',
                source: 'https://www.cdedirect.co.jp/plan/denki/basic_denki/',
                note: 'ガスとのセット割（電気0.5%割引）あり。カテエネポイント還元あり。',
                rates: [
                    { label: '基本料金（30A）', value: '830.70円/月' },
                    { label: '〜120kWh', value: '29.90円/kWh' },
                    { label: '120〜300kWh', value: '35.59円/kWh' },
                    { label: '300kWh〜', value: '36.50円/kWh' }
                ],
                calculate(kwh, gasId) {
                    let cost = 830.70;
                    cost += Math.min(kwh, 120) * 29.90;
                    cost += Math.min(Math.max(kwh - 120, 0), 180) * 35.59;
                    cost += Math.max(kwh - 300, 0) * 36.50;
                    // ガスセット割（0.5%割引）
                    if (gasId === 'cdenergy_gas') {
                        cost *= 0.995;
                    }
                    return cost;
                }
            },
            {
                id: 'octopus_elec_tokyo',
                name: 'オクトパスエナジー',
                plan: 'グリーンオクトパス',
                color: '#7B1FA2',
                source: 'https://octopusenergy.co.jp/tariffs',
                note: '基本料金は日額制。燃料費調整額の上限なし。',
                rates: [
                    { label: '基本料金', value: '29.10円/日（約873円/月）' },
                    { label: '〜120kWh', value: '18.98円/kWh' },
                    { label: '120〜300kWh', value: '24.10円/kWh' },
                    { label: '300kWh〜', value: '27.44円/kWh' }
                ],
                calculate(kwh) {
                    let cost = 29.10 * 30; // 基本料金（30日換算）
                    cost += Math.min(kwh, 120) * 18.98;
                    cost += Math.min(Math.max(kwh - 120, 0), 180) * 24.10;
                    cost += Math.max(kwh - 300, 0) * 27.44;
                    return cost;
                }
            },
            {
                id: 'octopus_simple_tokyo',
                name: 'オクトパスエナジー',
                plan: 'シンプルオクトパス',
                color: '#9C27B0',
                source: 'https://octopusenergy.co.jp/tariffs',
                note: '基本料金・燃料費調整額0円。1年後にグリーンオクトパスへ自動切替。',
                rates: [
                    { label: '基本料金', value: '0円' },
                    { label: '従量料金（一律）', value: '30.35円/kWh' }
                ],
                calculate(kwh) {
                    return kwh * 30.35;
                }
            },
            {
                id: 'rakuten_elec_tokyo',
                name: '楽天でんき',
                plan: 'プランS',
                color: '#BF0000',
                source: 'https://energy.rakuten.co.jp/electricity/fee/plan_s/',
                note: '基本料金0円。楽天ポイント還元あり。市場価格調整額は別途変動。',
                rates: [
                    { label: '基本料金', value: '0円' },
                    { label: '従量料金（一律）', value: '36.85円/kWh' }
                ],
                calculate(kwh) {
                    return kwh * 36.85;
                }
            }
        ],
        gas: [
            {
                id: 'tokyogas',
                name: '東京ガス',
                plan: '一般料金',
                color: '#0277BD',
                source: 'https://home.tokyo-gas.co.jp/gas_power/plan/gas/basic.html',
                rates: [
                    { label: '0〜20m3', value: '基本759.00円 + 145.31円/m3' },
                    { label: '20〜80m3', value: '基本1,056.00円 + 130.46円/m3' },
                    { label: '80〜200m3', value: '基本1,232.00円 + 128.26円/m3' },
                    { label: '200〜500m3', value: '基本1,892.00円 + 124.96円/m3' },
                    { label: '500〜800m3', value: '基本6,292.00円 + 116.16円/m3' }
                ],
                calculate(m3) {
                    if (m3 <= 0) return 0;
                    if (m3 <= 20) return 759.00 + m3 * 145.31;
                    if (m3 <= 80) return 1056.00 + m3 * 130.46;
                    if (m3 <= 200) return 1232.00 + m3 * 128.26;
                    if (m3 <= 500) return 1892.00 + m3 * 124.96;
                    if (m3 <= 800) return 6292.00 + m3 * 116.16;
                    return 12452.00 + m3 * 108.46;
                }
            },
            {
                id: 'lemongas',
                name: 'レモンガス',
                plan: 'わくわくプラン',
                color: '#F9A825',
                source: 'https://www.lemongas.co.jp/citygas/wakuwaku/',
                note: '東京ガスの基準単位料金より約5%割安。',
                rates: [
                    { label: '0〜20m3', value: '基本759.00円 + 138.04円/m3' },
                    { label: '20〜80m3', value: '基本1,041.13円 + 123.94円/m3' },
                    { label: '80〜200m3', value: '基本1,208.99円 + 121.84円/m3' },
                    { label: '200〜500m3', value: '基本1,834.35円 + 118.71円/m3' },
                    { label: '500〜800m3', value: '基本6,015.37円 + 110.35円/m3' }
                ],
                calculate(m3) {
                    if (m3 <= 0) return 0;
                    if (m3 <= 20) return 759.00 + m3 * 138.04;
                    if (m3 <= 80) return 1041.13 + m3 * 123.94;
                    if (m3 <= 200) return 1208.99 + m3 * 121.84;
                    if (m3 <= 500) return 1834.35 + m3 * 118.71;
                    if (m3 <= 800) return 6015.37 + m3 * 110.35;
                    return 11865.73 + m3 * 103.04;
                }
            },
            {
                id: 'elpio_gas_tokyo',
                name: 'エルピオ都市ガス',
                plan: 'スタンダードプラン',
                color: '#6A1B9A',
                source: 'https://www.lpio.jp/city_gas/city_plan/',
                note: '20m3以下は基本料金が高いが、単位料金が大幅に安い。',
                rates: [
                    { label: '0〜20m3', value: '基本975.00円 + 125.11円/m3' },
                    { label: '20〜80m3', value: '基本1,015.00円 + 124.00円/m3' },
                    { label: '80〜200m3', value: '基本1,232.00円 + 123.00円/m3' },
                    { label: '200〜500m3', value: '基本1,833.35円 + 119.84円/m3' },
                    { label: '500〜800m3', value: '基本6,034.03円 + 110.24円/m3' }
                ],
                calculate(m3) {
                    if (m3 <= 0) return 0;
                    if (m3 <= 20) return 975.00 + m3 * 125.11;
                    if (m3 <= 80) return 1015.00 + m3 * 124.00;
                    if (m3 <= 200) return 1232.00 + m3 * 123.00;
                    if (m3 <= 500) return 1833.35 + m3 * 119.84;
                    if (m3 <= 800) return 6034.03 + m3 * 110.24;
                    return 11941.00 + m3 * 105.10;
                }
            },
            {
                id: 'nichigas',
                name: 'ニチガス',
                plan: 'プレミアム+プラン',
                color: '#D84315',
                source: 'https://www.nichigas.co.jp/en/for-home/citygas',
                note: '0〜5m3は定額1,485円。従量料金は東京ガスより約5%割安。',
                rates: [
                    { label: '0〜5m3', value: '定額 1,485.00円' },
                    { label: '5〜20m3', value: '基本795.30円 + 138.05円/m3' },
                    { label: '20〜80m3', value: '基本1,077.57円 + 123.93円/m3' },
                    { label: '80〜200m3', value: '基本1,244.77円 + 121.83円/m3' },
                    { label: '200〜500m3', value: '基本1,871.77円 + 118.71円/m3' }
                ],
                calculate(m3) {
                    if (m3 <= 0) return 0;
                    if (m3 <= 5) return 1485.00;
                    if (m3 <= 20) return 795.30 + m3 * 138.05;
                    if (m3 <= 80) return 1077.57 + m3 * 123.93;
                    if (m3 <= 200) return 1244.77 + m3 * 121.83;
                    if (m3 <= 500) return 1871.77 + m3 * 118.71;
                    if (m3 <= 800) return 6051.77 + m3 * 110.35;
                    return 11903.77 + m3 * 103.03;
                }
            },
            {
                id: 'cdenergy_gas',
                name: 'CDエナジーダイレクト',
                plan: 'ベーシックガス',
                color: '#00838F',
                source: 'https://www.cdedirect.co.jp/plan/gas/basic_gas/',
                note: '電気とのセット割（ガス0.5%割引）あり。',
                rates: [
                    { label: '0〜20m3', value: '基本735.46円 + 140.76円/m3' },
                    { label: '20〜80m3', value: '基本1,022.38円 + 126.42円/m3' },
                    { label: '80〜200m3', value: '基本1,193.39円 + 124.28円/m3' },
                    { label: '200〜500m3', value: '基本1,833.02円 + 121.08円/m3' },
                    { label: '500〜800m3', value: '基本6,100.61円 + 112.54円/m3' }
                ],
                calculate(m3, elecId) {
                    if (m3 <= 0) return 0;
                    let cost;
                    if (m3 <= 20) cost = 735.46 + m3 * 140.76;
                    else if (m3 <= 80) cost = 1022.38 + m3 * 126.42;
                    else if (m3 <= 200) cost = 1193.39 + m3 * 124.28;
                    else if (m3 <= 500) cost = 1833.02 + m3 * 121.08;
                    else if (m3 <= 800) cost = 6100.61 + m3 * 112.54;
                    else cost = 12065.05 + m3 * 105.09;
                    // 電気セット割（0.5%割引）
                    if (elecId === 'cdenergy_elec') {
                        cost *= 0.995;
                    }
                    return cost;
                }
            }
        ],
        notes: [
            '料金は概算の参考値です。燃料費調整額・再エネ賦課金は含まれていません。',
            '実際の料金は時期や使用状況により異なります。契約前に各社の公式サイトをご確認ください。',
            '電気料金は30A契約を想定しています。アンペア数により基本料金が変わります。',
            '東京ガスの電気のセット割（0.5%割引）は東京ガスのガス契約時に自動適用されます。',
            'CDエナジーダイレクトの電気・ガスセット割（各0.5%割引）は計算に含まれています。',
            'オクトパスエナジーのグリーンオクトパスは燃料費調整額の上限がありません。市場価格により変動幅が大きい場合があります。',
            'シンプルオクトパスは基本料金・燃料費調整額0円のプランです。1年後にグリーンオクトパスへ自動切替されます。',
            '楽天でんきは市場価格調整額が別途変動します。ポイント還元は計算に含まれていません。',
            'ニチガスは0〜5m3が定額制のため、少量使用では割高になる場合があります。'
        ]
    },

    fukuoka: {
        name: '福岡',
        electricityLabel: '電力会社（九州エリア）',
        gasLabel: 'ガス会社（西部ガスエリア）',
        electricity: [
            {
                id: 'kyuden',
                name: '九州電力',
                plan: '従量電灯B（30A）',
                color: '#D32F2F',
                source: 'https://customer.kyuden.co.jp/ja/electricity/home-plan.html',
                rates: [
                    { label: '基本料金（30A）', value: '948.72円' },
                    { label: '〜120kWh', value: '18.37円/kWh' },
                    { label: '120〜300kWh', value: '23.97円/kWh' },
                    { label: '300kWh〜', value: '26.97円/kWh' }
                ],
                calculate(kwh) {
                    let cost = 948.72;
                    cost += Math.min(kwh, 120) * 18.37;
                    cost += Math.min(Math.max(kwh - 120, 0), 180) * 23.97;
                    cost += Math.max(kwh - 300, 0) * 26.97;
                    return cost;
                }
            },
            {
                id: 'saibugas_elec',
                name: '西部ガスの電気',
                plan: 'プラスでんきプラン1（30A）',
                color: '#1565C0',
                source: 'https://www.saibugas.co.jp/home/electric_power/plan/index.htm',
                rates: [
                    { label: '基本料金（30A）', value: '855.00円' },
                    { label: '〜120kWh', value: '18.37円/kWh' },
                    { label: '120〜300kWh', value: '23.97円/kWh' },
                    { label: '300kWh〜', value: '25.87円/kWh' }
                ],
                calculate(kwh) {
                    let cost = 855.00;
                    cost += Math.min(kwh, 120) * 18.37;
                    cost += Math.min(Math.max(kwh - 120, 0), 180) * 23.97;
                    cost += Math.max(kwh - 300, 0) * 25.87;
                    return cost;
                }
            },
            {
                id: 'idex',
                name: 'イデックスでんき',
                plan: 'ファミリープラン（30A）※新規受付終了',
                color: '#00897B',
                source: 'https://idexdenki.idex.co.jp/',
                note: '※ 新規受付は終了しています（参考掲載）',
                rates: [
                    { label: '基本料金（30A）', value: '939.23円' },
                    { label: '〜120kWh', value: '18.10円/kWh' },
                    { label: '120〜300kWh', value: '22.88円/kWh' },
                    { label: '300kWh〜', value: '24.14円/kWh' }
                ],
                calculate(kwh) {
                    let cost = 939.23;
                    cost += Math.min(kwh, 120) * 18.10;
                    cost += Math.min(Math.max(kwh - 120, 0), 180) * 22.88;
                    cost += Math.max(kwh - 300, 0) * 24.14;
                    return cost;
                }
            },
            {
                id: 'octopus_green',
                name: 'オクトパスエナジー',
                plan: 'グリーンオクトパス（30A）',
                color: '#7B1FA2',
                source: 'https://octopusenergy.co.jp/tariffs',
                note: '実質再生可能エネルギー100%。基本料金は日額制。燃料費調整額の上限なし。',
                rates: [
                    { label: '基本料金（30A）', value: '31.14円/日（約934円/月）' },
                    { label: '〜120kWh', value: '17.98円/kWh' },
                    { label: '120〜300kWh', value: '22.98円/kWh' },
                    { label: '300kWh〜', value: '24.68円/kWh' }
                ],
                calculate(kwh) {
                    let cost = 31.14 * 30;
                    cost += Math.min(kwh, 120) * 17.98;
                    cost += Math.min(Math.max(kwh - 120, 0), 180) * 22.98;
                    cost += Math.max(kwh - 300, 0) * 24.68;
                    return cost;
                }
            },
            {
                id: 'octopus_simple_kyushu',
                name: 'オクトパスエナジー',
                plan: 'シンプルオクトパス',
                color: '#9C27B0',
                source: 'https://octopusenergy.co.jp/tariffs',
                note: '基本料金・燃料費調整額0円。1年後にグリーンオクトパスへ自動切替。',
                rates: [
                    { label: '基本料金', value: '0円' },
                    { label: '従量料金（一律）', value: '37.20円/kWh' }
                ],
                calculate(kwh) {
                    return kwh * 37.20;
                }
            },
            {
                id: 'rakuten_elec',
                name: '楽天でんき',
                plan: 'プランS',
                color: '#C62828',
                source: 'https://energy.rakuten.co.jp/electricity/fee/',
                rates: [
                    { label: '基本料金', value: '0円' },
                    { label: '一律従量', value: '38.15円/kWh' }
                ],
                calculate(kwh) {
                    return kwh * 38.15;
                }
            }
        ],
        gas: [
            {
                id: 'saibugas',
                name: '西部ガス',
                plan: '一般料金',
                color: '#1565C0',
                source: 'https://www.saibugas.co.jp/home/rates/menu/index.htm',
                rates: [
                    { label: '0〜15m3', value: '基本913.00円 + 246.76円/m3' },
                    { label: '15〜30m3', value: '基本1,133.00円 + 232.10円/m3' },
                    { label: '30〜100m3', value: '基本1,562.00円 + 217.80円/m3' },
                    { label: '100m3〜', value: '基本2,167.00円 + 211.75円/m3' }
                ],
                calculate(m3) {
                    if (m3 <= 15) return 913.00 + m3 * 246.76;
                    if (m3 <= 30) return 1133.00 + m3 * 232.10;
                    if (m3 <= 100) return 1562.00 + m3 * 217.80;
                    return 2167.00 + m3 * 211.75;
                }
            },
            {
                id: 'saibugas_hinata',
                name: '西部ガス ヒナタメリット',
                plan: 'ヒナタメリット',
                color: '#FF8F00',
                source: 'https://www.saibugas.co.jp/home/hinata_merit/making/',
                rates: [
                    { label: '0〜15m3', value: '基本968.00円 + 243.10円/m3' },
                    { label: '15〜20m3', value: '基本1,133.00円 + 232.10円/m3' },
                    { label: '20m3〜', value: '基本1,518.00円 + 212.85円/m3' }
                ],
                calculate(m3) {
                    if (m3 <= 15) return 968.00 + m3 * 243.10;
                    if (m3 <= 20) return 1133.00 + m3 * 232.10;
                    return 1518.00 + m3 * 212.85;
                }
            },
            {
                id: 'elpio_gas',
                name: 'エルピオ都市ガス',
                plan: '九州エリア',
                color: '#2E7D32',
                source: 'https://www.lpio.jp/city_gas/%E8%A5%BF%E9%83%A8%E3%82%AC%E3%82%B9%E3%82%A8%E3%83%AA%E3%82%A2/',
                rates: [
                    { label: '0〜15m3', value: '基本884.70円 + 239.11円/m3' },
                    { label: '15〜30m3', value: '基本1,097.88円 + 224.90円/m3' },
                    { label: '30〜100m3', value: '基本1,513.58円 + 210.98円/m3' },
                    { label: '100m3〜', value: '基本2,099.82円 + 205.19円/m3' }
                ],
                calculate(m3) {
                    if (m3 <= 15) return 884.70 + m3 * 239.11;
                    if (m3 <= 30) return 1097.88 + m3 * 224.90;
                    if (m3 <= 100) return 1513.58 + m3 * 210.98;
                    return 2099.82 + m3 * 205.19;
                }
            },
            {
                id: 'tepco_gas',
                name: '東京電力EP',
                plan: 'とくとくガスプラン（九州）',
                color: '#F57C00',
                source: 'https://www.tepco.co.jp/ep/gas-jiyuuka/plan/kyushu/saibu/index-j.html',
                rates: [
                    { label: '0〜15m3', value: '基本885.61円 + 239.35円/m3' },
                    { label: '15〜30m3', value: '基本1,099.01円 + 225.13円/m3' },
                    { label: '30〜100m3', value: '基本1,515.14円 + 211.26円/m3' },
                    { label: '100m3〜', value: '基本2,101.99円 + 205.39円/m3' }
                ],
                calculate(m3) {
                    if (m3 <= 15) return 885.61 + m3 * 239.35;
                    if (m3 <= 30) return 1099.01 + m3 * 225.13;
                    if (m3 <= 100) return 1515.14 + m3 * 211.26;
                    return 2101.99 + m3 * 205.39;
                }
            }
        ],
        notes: [
            '料金は概算の参考値です。燃料費調整額・再エネ賦課金は含まれていません。',
            '実際の料金は時期や使用状況により異なります。契約前に各社の公式サイトをご確認ください。',
            '電気料金は30A契約を想定しています。アンペア数により基本料金が変わります。',
            'イデックスでんきは新規受付を終了しています。既存契約者向けの参考情報として掲載しています。',
            'オクトパスエナジーのグリーンオクトパスは燃料費調整額の上限がありません。市場価格により変動幅が大きい場合があります。',
            'シンプルオクトパスは基本料金・燃料費調整額0円のプランです。1年後にグリーンオクトパスへ自動切替されます。',
            '楽天でんきは市場価格調整額が別途変動します。ポイント還元は計算に含まれていません。',
            '西部ガス ヒナタメリットは西部ガスの電気とのセットプランです。ガス単体でも契約可能です。'
        ]
    }
};

// ===== 世帯人数プリセット =====
const HOUSEHOLD_PRESETS = {
    1: { kwh: 170, m3: 17, label: '1人暮らし平均' },
    2: { kwh: 250, m3: 28, label: '2人暮らし平均' },
    3: { kwh: 310, m3: 33, label: '3人暮らし平均' },
    4: { kwh: 370, m3: 39, label: '4人以上平均' }
};

// ===== 現在の地域 =====
let currentRegion = 'osaka';

// ===== DOM要素 =====
const kwhSlider = document.getElementById('kwh-slider');
const kwhInput = document.getElementById('kwh-input');
const m3Slider = document.getElementById('m3-slider');
const m3Input = document.getElementById('m3-input');
const bestCard = document.getElementById('best-card');
const tableBody = document.querySelector('#results-table tbody');
const pageTitle = document.getElementById('page-title');

// ===== チャートインスタンス =====
let combinationChart = null;
let electricityChart = null;
let gasChart = null;
let annualChart = null;

// ===== ユーティリティ =====
function formatYen(num) {
    return Math.round(num).toLocaleString('ja-JP');
}

function getProviders() {
    return REGIONS[currentRegion];
}

// ===== 全組み合わせを計算 =====
function calculateCombinations(kwh, m3) {
    const region = getProviders();
    const results = [];

    for (const elec of region.electricity) {
        for (const gas of region.gas) {
            const elecCost = elec.calculate(kwh, gas.id);
            const gasCost = gas.calculate ? (gas.calculate.length > 1 ? gas.calculate(m3, elec.id) : gas.calculate(m3)) : 0;

            let elecPlanLabel = elec.plan;
            let comboNote = '';

            // 大阪ガスの電気 + 大阪ガスの場合のプラン表示
            if (elec.id === 'osakagas_elec') {
                elecPlanLabel = gas.id === 'osakagas' ? 'ベースプランA-G' : 'ベースプランA';
            }
            // 東京ガスの電気セット割表示
            if (elec.id === 'tokyogas_elec' && gas.id === 'tokyogas') {
                comboNote = '東京ガスセット割（0.5%割引）適用';
            }
            // CDエナジーセット割表示
            if (elec.id === 'cdenergy_elec' && gas.id === 'cdenergy_gas') {
                comboNote = 'CDエナジー電気・ガスセット割（各0.5%割引）適用';
            }

            if (!comboNote && elec.note) {
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
    const region = getProviders();
    const data = region.electricity.map(p => ({
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
    const region = getProviders();
    const data = region.gas.map(p => ({
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

    const region = getProviders();
    let html = '';

    html += `<h3>${region.electricityLabel}</h3><div class="source-grid">`;
    for (const p of region.electricity) {
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

    html += `<h3>${region.gasLabel}</h3><div class="source-grid">`;
    for (const p of region.gas) {
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

// ===== 注意事項描画 =====
function renderNotes() {
    const region = getProviders();
    const notesList = document.querySelector('.notes-section ul');
    if (!notesList) return;
    notesList.innerHTML = region.notes.map(n => `<li>${n}</li>`).join('');
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

// ===== 地域切り替え =====
function switchRegion(region) {
    currentRegion = region;
    const regionData = getProviders();
    pageTitle.textContent = `${regionData.name} 電気・ガス 最安比較`;

    // チャート高さを組み合わせ数に応じて調整
    const combCount = regionData.electricity.length * regionData.gas.length;
    const chartEl = document.querySelector('.chart-combination');
    chartEl.style.minHeight = `${Math.max(400, combCount * 28 + 80)}px`;

    renderSources();
    renderNotes();
    calculate();
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

// 地域選択
document.querySelectorAll('.region-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.region-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        switchRegion(btn.dataset.region);
    });
});

// ===== 初期描画 =====
switchRegion('osaka');
