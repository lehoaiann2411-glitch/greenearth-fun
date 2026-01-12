export interface Island {
  nameKey: string;
  coords: [number, number]; // [lng, lat]
}

export interface Archipelago {
  id: string;
  nameKey: string;
  region: 'southeast_asia' | 'pacific' | 'atlantic' | 'indian' | 'europe' | 'arctic' | 'north_america' | 'south_america' | 'africa' | 'oceania' | 'russia';
  sovereignty?: string;
  highlighted?: boolean;
  center: [number, number]; // [lng, lat]
  color: string;
  seaArea?: string;
  islandCount?: string;
  islands: Island[];
}

export const WORLD_ARCHIPELAGOS: Record<string, Archipelago> = {
  // ==================== SOUTHEAST ASIA (Vietnam Highlighted) ====================
  hoangSa: {
    id: 'hoang-sa',
    nameKey: 'islands.hoangSa',
    region: 'southeast_asia',
    sovereignty: 'Vietnam',
    highlighted: true,
    center: [112.0, 16.5],
    color: '#dc2626',
    seaArea: '~15,000',
    islandCount: '130+',
    islands: [
      { nameKey: 'islands.phuLam', coords: [111.92, 16.83] },
      { nameKey: 'islands.hoangSaIsland', coords: [112.33, 16.52] },
      { nameKey: 'islands.triTon', coords: [111.20, 15.78] },
      { nameKey: 'islands.linCon', coords: [111.67, 16.67] },
      { nameKey: 'islands.quangAnh', coords: [112.17, 16.47] },
    ]
  },
  truongSa: {
    id: 'truong-sa',
    nameKey: 'islands.truongSa',
    region: 'southeast_asia',
    sovereignty: 'Vietnam',
    highlighted: true,
    center: [114.0, 9.5],
    color: '#dc2626',
    seaArea: '~160,000',
    islandCount: '100+',
    islands: [
      { nameKey: 'islands.truongSaLon', coords: [111.92, 8.65] },
      { nameKey: 'islands.sinhTon', coords: [114.33, 9.88] },
      { nameKey: 'islands.songTuTay', coords: [114.32, 11.43] },
      { nameKey: 'islands.namYet', coords: [114.37, 10.18] },
      { nameKey: 'islands.anBang', coords: [112.90, 7.87] },
    ]
  },

  // ==================== PACIFIC OCEAN ====================
  hawaii: {
    id: 'hawaii',
    nameKey: 'islands.hawaii',
    region: 'pacific',
    sovereignty: 'USA',
    center: [-155.5, 20.5],
    color: '#3b82f6',
    seaArea: '~28,311',
    islandCount: '137',
    islands: [
      { nameKey: 'islands.oahu', coords: [-157.99, 21.47] },
      { nameKey: 'islands.maui', coords: [-156.33, 20.79] },
      { nameKey: 'islands.bigIsland', coords: [-155.52, 19.6] },
      { nameKey: 'islands.kauai', coords: [-159.53, 22.07] },
      { nameKey: 'islands.molokai', coords: [-157.02, 21.13] },
    ]
  },
  galapagos: {
    id: 'galapagos',
    nameKey: 'islands.galapagos',
    region: 'pacific',
    sovereignty: 'Ecuador',
    center: [-90.5, -0.5],
    color: '#22c55e',
    seaArea: '~45,000',
    islandCount: '21',
    islands: [
      { nameKey: 'islands.isabela', coords: [-91.07, -0.42] },
      { nameKey: 'islands.santaCruz', coords: [-90.35, -0.62] },
      { nameKey: 'islands.sanCristobal', coords: [-89.43, -0.9] },
      { nameKey: 'islands.fernandina', coords: [-91.55, -0.37] },
    ]
  },
  fiji: {
    id: 'fiji',
    nameKey: 'islands.fiji',
    region: 'pacific',
    sovereignty: 'Fiji',
    center: [178.0, -17.8],
    color: '#06b6d4',
    seaArea: '~18,274',
    islandCount: '330+',
    islands: [
      { nameKey: 'islands.vitiLevu', coords: [177.95, -17.77] },
      { nameKey: 'islands.vanuaLevu', coords: [179.2, -16.55] },
      { nameKey: 'islands.taveuni', coords: [-179.9, -16.87] },
    ]
  },
  tahiti: {
    id: 'tahiti',
    nameKey: 'islands.tahiti',
    region: 'pacific',
    sovereignty: 'France',
    center: [-149.4, -17.5],
    color: '#8b5cf6',
    seaArea: '~4,167',
    islandCount: '118',
    islands: [
      { nameKey: 'islands.tahitiIsland', coords: [-149.43, -17.65] },
      { nameKey: 'islands.moorea', coords: [-149.85, -17.53] },
      { nameKey: 'islands.borabora', coords: [-151.74, -16.5] },
    ]
  },
  samoa: {
    id: 'samoa',
    nameKey: 'islands.samoa',
    region: 'pacific',
    sovereignty: 'Samoa/USA',
    center: [-172.0, -13.8],
    color: '#14b8a6',
    seaArea: '~2,842',
    islandCount: '14',
    islands: [
      { nameKey: 'islands.upolu', coords: [-171.76, -13.85] },
      { nameKey: 'islands.savaii', coords: [-172.45, -13.63] },
    ]
  },
  tonga: {
    id: 'tonga',
    nameKey: 'islands.tonga',
    region: 'pacific',
    sovereignty: 'Tonga',
    center: [-175.2, -21.2],
    color: '#f59e0b',
    seaArea: '~747',
    islandCount: '169',
    islands: [
      { nameKey: 'islands.tongatapu', coords: [-175.2, -21.21] },
      { nameKey: 'islands.vavau', coords: [-174.0, -18.65] },
    ]
  },
  solomonIslands: {
    id: 'solomon-islands',
    nameKey: 'islands.solomonIslands',
    region: 'pacific',
    sovereignty: 'Solomon Islands',
    center: [160.0, -9.0],
    color: '#84cc16',
    seaArea: '~28,400',
    islandCount: '990+',
    islands: [
      { nameKey: 'islands.guadalcanal', coords: [160.02, -9.43] },
      { nameKey: 'islands.malaita', coords: [160.95, -8.95] },
    ]
  },
  newCaledonia: {
    id: 'new-caledonia',
    nameKey: 'islands.newCaledonia',
    region: 'pacific',
    sovereignty: 'France',
    center: [165.5, -21.5],
    color: '#ec4899',
    seaArea: '~18,575',
    islandCount: '40+',
    islands: [
      { nameKey: 'islands.grandeTerreSud', coords: [166.45, -22.27] },
      { nameKey: 'islands.lifou', coords: [167.25, -20.92] },
    ]
  },

  // ==================== ATLANTIC OCEAN ====================
  caribbean: {
    id: 'caribbean',
    nameKey: 'islands.caribbean',
    region: 'atlantic',
    center: [-70.0, 18.0],
    color: '#f97316',
    seaArea: '~2,754,000',
    islandCount: '700+',
    islands: [
      { nameKey: 'islands.cuba', coords: [-77.78, 21.52] },
      { nameKey: 'islands.jamaica', coords: [-77.29, 18.11] },
      { nameKey: 'islands.puertoRico', coords: [-66.59, 18.22] },
      { nameKey: 'islands.hispaniola', coords: [-70.16, 18.97] },
      { nameKey: 'islands.trinidad', coords: [-61.26, 10.44] },
    ]
  },
  bahamas: {
    id: 'bahamas',
    nameKey: 'islands.bahamas',
    region: 'atlantic',
    sovereignty: 'Bahamas',
    center: [-77.0, 24.5],
    color: '#eab308',
    seaArea: '~13,878',
    islandCount: '700+',
    islands: [
      { nameKey: 'islands.nassau', coords: [-77.34, 25.06] },
      { nameKey: 'islands.grandBahama', coords: [-78.46, 26.66] },
      { nameKey: 'islands.andros', coords: [-77.96, 24.26] },
    ]
  },
  canaryIslands: {
    id: 'canary-islands',
    nameKey: 'islands.canaryIslands',
    region: 'atlantic',
    sovereignty: 'Spain',
    center: [-16.0, 28.3],
    color: '#ef4444',
    seaArea: '~7,493',
    islandCount: '8',
    islands: [
      { nameKey: 'islands.tenerife', coords: [-16.55, 28.29] },
      { nameKey: 'islands.granCanaria', coords: [-15.58, 27.96] },
      { nameKey: 'islands.lanzarote', coords: [-13.63, 29.05] },
      { nameKey: 'islands.fuerteventura', coords: [-14.01, 28.36] },
    ]
  },
  azores: {
    id: 'azores',
    nameKey: 'islands.azores',
    region: 'atlantic',
    sovereignty: 'Portugal',
    center: [-27.0, 38.5],
    color: '#10b981',
    seaArea: '~2,346',
    islandCount: '9',
    islands: [
      { nameKey: 'islands.saoMiguel', coords: [-25.51, 37.78] },
      { nameKey: 'islands.terceira', coords: [-27.22, 38.72] },
      { nameKey: 'islands.pico', coords: [-28.32, 38.47] },
    ]
  },
  capeVerde: {
    id: 'cape-verde',
    nameKey: 'islands.capeVerde',
    region: 'atlantic',
    sovereignty: 'Cape Verde',
    center: [-23.5, 16.0],
    color: '#6366f1',
    seaArea: '~4,033',
    islandCount: '10',
    islands: [
      { nameKey: 'islands.santiago', coords: [-23.62, 15.06] },
      { nameKey: 'islands.sal', coords: [-22.93, 16.73] },
      { nameKey: 'islands.boaVista', coords: [-22.8, 16.1] },
    ]
  },
  bermuda: {
    id: 'bermuda',
    nameKey: 'islands.bermuda',
    region: 'atlantic',
    sovereignty: 'UK',
    center: [-64.75, 32.3],
    color: '#f472b6',
    seaArea: '~53',
    islandCount: '181',
    islands: [
      { nameKey: 'islands.bermudaMain', coords: [-64.75, 32.3] },
    ]
  },
  falkland: {
    id: 'falkland',
    nameKey: 'islands.falkland',
    region: 'atlantic',
    sovereignty: 'UK',
    center: [-59.0, -51.75],
    color: '#64748b',
    seaArea: '~12,173',
    islandCount: '778',
    islands: [
      { nameKey: 'islands.eastFalkland', coords: [-58.7, -51.68] },
      { nameKey: 'islands.westFalkland', coords: [-60.0, -51.85] },
    ]
  },

  // ==================== INDIAN OCEAN ====================
  maldives: {
    id: 'maldives',
    nameKey: 'islands.maldives',
    region: 'indian',
    sovereignty: 'Maldives',
    center: [73.22, 3.2],
    color: '#06b6d4',
    seaArea: '~298',
    islandCount: '1,192',
    islands: [
      { nameKey: 'islands.male', coords: [73.51, 4.17] },
      { nameKey: 'islands.hulhumale', coords: [73.54, 4.21] },
      { nameKey: 'islands.maafushi', coords: [73.49, 3.94] },
    ]
  },
  seychelles: {
    id: 'seychelles',
    nameKey: 'islands.seychelles',
    region: 'indian',
    sovereignty: 'Seychelles',
    center: [55.45, -4.68],
    color: '#14b8a6',
    seaArea: '~459',
    islandCount: '115',
    islands: [
      { nameKey: 'islands.mahe', coords: [55.46, -4.68] },
      { nameKey: 'islands.praslin', coords: [55.74, -4.33] },
      { nameKey: 'islands.laDigue', coords: [55.83, -4.36] },
    ]
  },
  mauritius: {
    id: 'mauritius',
    nameKey: 'islands.mauritius',
    region: 'indian',
    sovereignty: 'Mauritius',
    center: [57.55, -20.35],
    color: '#f59e0b',
    seaArea: '~2,040',
    islandCount: '9',
    islands: [
      { nameKey: 'islands.mauritiusMain', coords: [57.55, -20.35] },
      { nameKey: 'islands.rodrigues', coords: [63.42, -19.72] },
    ]
  },
  madagascar: {
    id: 'madagascar',
    nameKey: 'islands.madagascar',
    region: 'indian',
    sovereignty: 'Madagascar',
    center: [46.87, -18.77],
    color: '#84cc16',
    seaArea: '~587,041',
    islandCount: '1',
    islands: [
      { nameKey: 'islands.madagascarMain', coords: [46.87, -18.77] },
      { nameKey: 'islands.nosyBe', coords: [48.27, -13.33] },
    ]
  },
  reunion: {
    id: 'reunion',
    nameKey: 'islands.reunion',
    region: 'indian',
    sovereignty: 'France',
    center: [55.53, -21.12],
    color: '#8b5cf6',
    seaArea: '~2,512',
    islandCount: '1',
    islands: [
      { nameKey: 'islands.reunionMain', coords: [55.53, -21.12] },
    ]
  },
  andaman: {
    id: 'andaman',
    nameKey: 'islands.andaman',
    region: 'indian',
    sovereignty: 'India',
    center: [92.7, 11.7],
    color: '#22c55e',
    seaArea: '~8,249',
    islandCount: '572',
    islands: [
      { nameKey: 'islands.portBlair', coords: [92.74, 11.62] },
      { nameKey: 'islands.havelock', coords: [92.98, 12.02] },
      { nameKey: 'islands.nicobar', coords: [93.85, 7.03] },
    ]
  },

  // ==================== EUROPE ====================
  greekIslands: {
    id: 'greek-islands',
    nameKey: 'islands.greekIslands',
    region: 'europe',
    sovereignty: 'Greece',
    center: [25.0, 37.0],
    color: '#3b82f6',
    seaArea: '~25,000',
    islandCount: '6,000+',
    islands: [
      { nameKey: 'islands.crete', coords: [24.9, 35.24] },
      { nameKey: 'islands.santorini', coords: [25.43, 36.39] },
      { nameKey: 'islands.mykonos', coords: [25.33, 37.45] },
      { nameKey: 'islands.rhodes', coords: [28.23, 36.43] },
      { nameKey: 'islands.corfu', coords: [19.92, 39.62] },
    ]
  },
  balearic: {
    id: 'balearic',
    nameKey: 'islands.balearic',
    region: 'europe',
    sovereignty: 'Spain',
    center: [2.9, 39.5],
    color: '#ef4444',
    seaArea: '~4,992',
    islandCount: '5',
    islands: [
      { nameKey: 'islands.mallorca', coords: [2.98, 39.62] },
      { nameKey: 'islands.ibiza', coords: [1.43, 38.98] },
      { nameKey: 'islands.menorca', coords: [4.08, 39.95] },
    ]
  },
  faroe: {
    id: 'faroe',
    nameKey: 'islands.faroe',
    region: 'europe',
    sovereignty: 'Denmark',
    center: [-6.9, 62.0],
    color: '#64748b',
    seaArea: '~1,393',
    islandCount: '18',
    islands: [
      { nameKey: 'islands.streymoy', coords: [-6.77, 62.01] },
      { nameKey: 'islands.eysturoy', coords: [-6.93, 62.22] },
    ]
  },
  channelIslands: {
    id: 'channel-islands',
    nameKey: 'islands.channelIslands',
    region: 'europe',
    sovereignty: 'UK',
    center: [-2.13, 49.45],
    color: '#10b981',
    seaArea: '~194',
    islandCount: '8',
    islands: [
      { nameKey: 'islands.jersey', coords: [-2.13, 49.21] },
      { nameKey: 'islands.guernsey', coords: [-2.54, 49.45] },
    ]
  },
  malta: {
    id: 'malta',
    nameKey: 'islands.malta',
    region: 'europe',
    sovereignty: 'Malta',
    center: [14.45, 35.9],
    color: '#f97316',
    seaArea: '~316',
    islandCount: '3',
    islands: [
      { nameKey: 'islands.maltaMain', coords: [14.45, 35.9] },
      { nameKey: 'islands.gozo', coords: [14.25, 36.04] },
    ]
  },

  // ==================== ARCTIC / SUBARCTIC ====================
  svalbard: {
    id: 'svalbard',
    nameKey: 'islands.svalbard',
    region: 'arctic',
    sovereignty: 'Norway',
    center: [16.0, 78.0],
    color: '#94a3b8',
    seaArea: '~62,045',
    islandCount: '400+',
    islands: [
      { nameKey: 'islands.spitsbergen', coords: [15.63, 78.22] },
      { nameKey: 'islands.nordaustlandet', coords: [23.0, 79.5] },
    ]
  },
  iceland: {
    id: 'iceland',
    nameKey: 'islands.iceland',
    region: 'arctic',
    sovereignty: 'Iceland',
    center: [-19.0, 65.0],
    color: '#0ea5e9',
    seaArea: '~103,000',
    islandCount: '30+',
    islands: [
      { nameKey: 'islands.icelandMain', coords: [-19.0, 65.0] },
      { nameKey: 'islands.westmanIslands', coords: [-20.27, 63.43] },
    ]
  },
  greenland: {
    id: 'greenland',
    nameKey: 'islands.greenland',
    region: 'arctic',
    sovereignty: 'Denmark',
    center: [-42.0, 72.0],
    color: '#e2e8f0',
    seaArea: '~2,166,086',
    islandCount: '1',
    islands: [
      { nameKey: 'islands.greenlandMain', coords: [-42.0, 72.0] },
      { nameKey: 'islands.disko', coords: [-53.5, 69.75] },
    ]
  },

  // ==================== ADDITIONAL SOUTHEAST ASIA ====================
  philippines: {
    id: 'philippines',
    nameKey: 'islands.philippines',
    region: 'southeast_asia',
    sovereignty: 'Philippines',
    center: [121.77, 12.88],
    color: '#f59e0b',
    seaArea: '~300,000',
    islandCount: '7,641',
    islands: [
      { nameKey: 'islands.luzon', coords: [121.0, 16.0] },
      { nameKey: 'islands.visayas', coords: [123.5, 10.5] },
      { nameKey: 'islands.mindanao', coords: [125.5, 7.5] },
      { nameKey: 'islands.palawan', coords: [118.7, 9.8] },
    ]
  },
  indonesia: {
    id: 'indonesia',
    nameKey: 'islands.indonesia',
    region: 'southeast_asia',
    sovereignty: 'Indonesia',
    center: [113.9, -0.79],
    color: '#ef4444',
    seaArea: '~1,904,569',
    islandCount: '17,508',
    islands: [
      { nameKey: 'islands.java', coords: [110.0, -7.5] },
      { nameKey: 'islands.sumatra', coords: [101.5, 0.5] },
      { nameKey: 'islands.borneo', coords: [116.0, 0.5] },
      { nameKey: 'islands.sulawesi', coords: [121.0, -2.0] },
      { nameKey: 'islands.bali', coords: [115.2, -8.4] },
    ]
  },

  // ==================== EAST ASIA ====================
  japan: {
    id: 'japan',
    nameKey: 'islands.japan',
    region: 'pacific',
    sovereignty: 'Japan',
    center: [138.25, 36.2],
    color: '#dc2626',
    seaArea: '~377,975',
    islandCount: '6,852',
    islands: [
      { nameKey: 'islands.honshu', coords: [138.0, 36.0] },
      { nameKey: 'islands.hokkaido', coords: [143.0, 43.0] },
      { nameKey: 'islands.kyushu', coords: [131.0, 33.0] },
      { nameKey: 'islands.shikoku', coords: [133.5, 33.8] },
      { nameKey: 'islands.okinawa', coords: [127.8, 26.5] },
    ]
  },
  taiwan: {
    id: 'taiwan',
    nameKey: 'islands.taiwan',
    region: 'pacific',
    sovereignty: 'Taiwan',
    center: [121.0, 23.7],
    color: '#3b82f6',
    seaArea: '~36,193',
    islandCount: '166',
    islands: [
      { nameKey: 'islands.taiwanMain', coords: [121.0, 23.7] },
      { nameKey: 'islands.penghu', coords: [119.6, 23.6] },
    ]
  },

  // ==================== OCEANIA ====================
  newZealand: {
    id: 'new-zealand',
    nameKey: 'islands.newZealand',
    region: 'pacific',
    sovereignty: 'New Zealand',
    center: [174.0, -41.0],
    color: '#22c55e',
    seaArea: '~268,021',
    islandCount: '600+',
    islands: [
      { nameKey: 'islands.northIsland', coords: [175.5, -39.0] },
      { nameKey: 'islands.southIsland', coords: [170.5, -44.0] },
      { nameKey: 'islands.stewart', coords: [167.8, -46.9] },
    ]
  },
  vanuatu: {
    id: 'vanuatu',
    nameKey: 'islands.vanuatu',
    region: 'pacific',
    sovereignty: 'Vanuatu',
    center: [166.96, -15.38],
    color: '#84cc16',
    seaArea: '~12,189',
    islandCount: '83',
    islands: [
      { nameKey: 'islands.efate', coords: [168.3, -17.7] },
      { nameKey: 'islands.espiritu', coords: [167.0, -15.4] },
    ]
  },
  palau: {
    id: 'palau',
    nameKey: 'islands.palau',
    region: 'pacific',
    sovereignty: 'Palau',
    center: [134.58, 7.51],
    color: '#06b6d4',
    seaArea: '~459',
    islandCount: '340',
    islands: [
      { nameKey: 'islands.babeldaob', coords: [134.6, 7.5] },
      { nameKey: 'islands.koror', coords: [134.47, 7.34] },
    ]
  },
  guam: {
    id: 'guam',
    nameKey: 'islands.guam',
    region: 'pacific',
    sovereignty: 'USA',
    center: [144.79, 13.44],
    color: '#3b82f6',
    seaArea: '~549',
    islandCount: '1',
    islands: [
      { nameKey: 'islands.guamMain', coords: [144.79, 13.44] },
    ]
  },
  mariana: {
    id: 'mariana',
    nameKey: 'islands.mariana',
    region: 'pacific',
    sovereignty: 'USA',
    center: [145.75, 15.2],
    color: '#8b5cf6',
    seaArea: '~464',
    islandCount: '15',
    islands: [
      { nameKey: 'islands.saipan', coords: [145.75, 15.2] },
      { nameKey: 'islands.tinian', coords: [145.63, 15.0] },
    ]
  },
  cookIslands: {
    id: 'cook-islands',
    nameKey: 'islands.cookIslands',
    region: 'pacific',
    sovereignty: 'New Zealand',
    center: [-159.78, -21.24],
    color: '#14b8a6',
    seaArea: '~236',
    islandCount: '15',
    islands: [
      { nameKey: 'islands.rarotonga', coords: [-159.78, -21.24] },
      { nameKey: 'islands.aitutaki', coords: [-159.77, -18.86] },
    ]
  },
  marshallIslands: {
    id: 'marshall-islands',
    nameKey: 'islands.marshallIslands',
    region: 'pacific',
    sovereignty: 'Marshall Islands',
    center: [171.18, 7.13],
    color: '#f97316',
    seaArea: '~181',
    islandCount: '1,156',
    islands: [
      { nameKey: 'islands.majuro', coords: [171.38, 7.09] },
      { nameKey: 'islands.kwajalein', coords: [167.73, 8.72] },
    ]
  },
  micronesia: {
    id: 'micronesia',
    nameKey: 'islands.micronesia',
    region: 'pacific',
    sovereignty: 'Micronesia',
    center: [158.22, 6.92],
    color: '#6366f1',
    seaArea: '~702',
    islandCount: '607',
    islands: [
      { nameKey: 'islands.pohnpei', coords: [158.22, 6.88] },
      { nameKey: 'islands.chuuk', coords: [151.85, 7.42] },
    ]
  },
  kiribati: {
    id: 'kiribati',
    nameKey: 'islands.kiribati',
    region: 'pacific',
    sovereignty: 'Kiribati',
    center: [-157.36, 1.87],
    color: '#eab308',
    seaArea: '~811',
    islandCount: '33',
    islands: [
      { nameKey: 'islands.tarawa', coords: [172.98, 1.43] },
      { nameKey: 'islands.christmas', coords: [-157.47, 1.87] },
    ]
  },
  tuvalu: {
    id: 'tuvalu',
    nameKey: 'islands.tuvalu',
    region: 'pacific',
    sovereignty: 'Tuvalu',
    center: [179.2, -7.48],
    color: '#10b981',
    seaArea: '~26',
    islandCount: '9',
    islands: [
      { nameKey: 'islands.funafuti', coords: [179.2, -8.52] },
    ]
  },

  // ==================== ADDITIONAL EUROPE ====================
  sicily: {
    id: 'sicily',
    nameKey: 'islands.sicily',
    region: 'europe',
    sovereignty: 'Italy',
    center: [14.0, 37.6],
    color: '#22c55e',
    seaArea: '~25,711',
    islandCount: '1',
    islands: [
      { nameKey: 'islands.sicilyMain', coords: [14.0, 37.6] },
    ]
  },
  sardinia: {
    id: 'sardinia',
    nameKey: 'islands.sardinia',
    region: 'europe',
    sovereignty: 'Italy',
    center: [9.12, 40.12],
    color: '#14b8a6',
    seaArea: '~24,090',
    islandCount: '1',
    islands: [
      { nameKey: 'islands.sardiniaMain', coords: [9.12, 40.12] },
    ]
  },
  corsica: {
    id: 'corsica',
    nameKey: 'islands.corsica',
    region: 'europe',
    sovereignty: 'France',
    center: [9.0, 42.04],
    color: '#3b82f6',
    seaArea: '~8,680',
    islandCount: '1',
    islands: [
      { nameKey: 'islands.corsicaMain', coords: [9.0, 42.04] },
    ]
  },
  cyprus: {
    id: 'cyprus',
    nameKey: 'islands.cyprus',
    region: 'europe',
    sovereignty: 'Cyprus',
    center: [33.43, 35.13],
    color: '#f59e0b',
    seaArea: '~9,251',
    islandCount: '1',
    islands: [
      { nameKey: 'islands.cyprusMain', coords: [33.43, 35.13] },
    ]
  },

  // ==================== ADDITIONAL INDIAN OCEAN ====================
  sriLanka: {
    id: 'sri-lanka',
    nameKey: 'islands.sriLanka',
    region: 'indian',
    sovereignty: 'Sri Lanka',
    center: [80.77, 7.87],
    color: '#dc2626',
    seaArea: '~65,610',
    islandCount: '1',
    islands: [
      { nameKey: 'islands.sriLankaMain', coords: [80.77, 7.87] },
    ]
  },
  zanzibar: {
    id: 'zanzibar',
    nameKey: 'islands.zanzibar',
    region: 'indian',
    sovereignty: 'Tanzania',
    center: [39.2, -6.16],
    color: '#84cc16',
    seaArea: '~2,654',
    islandCount: '2',
    islands: [
      { nameKey: 'islands.unguja', coords: [39.2, -6.16] },
      { nameKey: 'islands.pemba', coords: [39.75, -5.0] },
    ]
  },
  comoros: {
    id: 'comoros',
    nameKey: 'islands.comoros',
    region: 'indian',
    sovereignty: 'Comoros',
    center: [43.87, -11.88],
    color: '#22c55e',
    seaArea: '~2,235',
    islandCount: '4',
    islands: [
      { nameKey: 'islands.grandeComore', coords: [43.33, -11.7] },
      { nameKey: 'islands.anjouan', coords: [44.44, -12.23] },
      { nameKey: 'islands.mayotte', coords: [45.14, -12.83] },
    ]
  },

  // ==================== SOUTH AMERICA ====================
  easterIsland: {
    id: 'easter-island',
    nameKey: 'islands.easterIsland',
    region: 'pacific',
    sovereignty: 'Chile',
    center: [-109.35, -27.12],
    color: '#dc2626',
    seaArea: '~163',
    islandCount: '1',
    islands: [
      { nameKey: 'islands.easterIslandMain', coords: [-109.35, -27.12] },
    ]
  },
  fernandoDeNoronha: {
    id: 'fernando-de-noronha',
    nameKey: 'islands.fernandoDeNoronha',
    region: 'atlantic',
    sovereignty: 'Brazil',
    center: [-32.42, -3.85],
    color: '#22c55e',
    seaArea: '~26',
    islandCount: '21',
    islands: [
      { nameKey: 'islands.noronhaMain', coords: [-32.42, -3.85] },
    ]
  },

  // ==================== RUSSIA ====================
  sakhalin: {
    id: 'sakhalin',
    nameKey: 'islands.sakhalin',
    region: 'russia',
    sovereignty: 'Russia',
    center: [143.0, 50.5],
    color: '#ef4444',
    seaArea: '~76,400',
    islandCount: '1',
    islands: [
      { nameKey: 'islands.sakhalinMain', coords: [143.0, 50.5] },
    ]
  },
  kurilIslands: {
    id: 'kuril-islands',
    nameKey: 'islands.kurilIslands',
    region: 'russia',
    sovereignty: 'Russia',
    center: [150.5, 46.0],
    color: '#dc2626',
    seaArea: '~10,500',
    islandCount: '56',
    islands: [
      { nameKey: 'islands.iturup', coords: [148.0, 45.0] },
      { nameKey: 'islands.kunashir', coords: [145.85, 44.0] },
      { nameKey: 'islands.shikotan', coords: [146.75, 43.8] },
      { nameKey: 'islands.paramushir', coords: [155.7, 50.3] },
    ]
  },
  novayaZemlya: {
    id: 'novaya-zemlya',
    nameKey: 'islands.novayaZemlya',
    region: 'russia',
    sovereignty: 'Russia',
    center: [56.0, 74.0],
    color: '#94a3b8',
    seaArea: '~90,650',
    islandCount: '2',
    islands: [
      { nameKey: 'islands.severnyIsland', coords: [56.0, 75.0] },
      { nameKey: 'islands.yuzhnyIsland', coords: [56.0, 72.5] },
    ]
  },
  newSiberianIslands: {
    id: 'new-siberian-islands',
    nameKey: 'islands.newSiberianIslands',
    region: 'russia',
    sovereignty: 'Russia',
    center: [140.0, 75.0],
    color: '#64748b',
    seaArea: '~38,400',
    islandCount: '24',
    islands: [
      { nameKey: 'islands.kotelny', coords: [137.5, 75.4] },
      { nameKey: 'islands.faddeevsky', coords: [144.0, 75.5] },
    ]
  },
  franzJosefLand: {
    id: 'franz-josef-land',
    nameKey: 'islands.franzJosefLand',
    region: 'russia',
    sovereignty: 'Russia',
    center: [55.0, 80.5],
    color: '#475569',
    seaArea: '~16,134',
    islandCount: '192',
    islands: [
      { nameKey: 'islands.alexandraLand', coords: [47.0, 80.5] },
      { nameKey: 'islands.georgeLand', coords: [52.5, 80.8] },
      { nameKey: 'islands.rudolfIsland', coords: [58.5, 81.8] },
    ]
  },
  wrangelIsland: {
    id: 'wrangel-island',
    nameKey: 'islands.wrangelIsland',
    region: 'russia',
    sovereignty: 'Russia',
    center: [-179.0, 71.0],
    color: '#78716c',
    seaArea: '~7,600',
    islandCount: '1',
    islands: [
      { nameKey: 'islands.wrangelMain', coords: [-179.0, 71.0] },
    ]
  },

  // ==================== NORTH AMERICA ====================
  vancouverIsland: {
    id: 'vancouver-island',
    nameKey: 'islands.vancouverIsland',
    region: 'north_america',
    sovereignty: 'Canada',
    center: [-125.5, 49.5],
    color: '#ef4444',
    seaArea: '~31,285',
    islandCount: '1',
    islands: [
      { nameKey: 'islands.vancouverMain', coords: [-125.5, 49.5] },
      { nameKey: 'islands.victoria', coords: [-123.37, 48.43] },
    ]
  },
  baffinIsland: {
    id: 'baffin-island',
    nameKey: 'islands.baffinIsland',
    region: 'north_america',
    sovereignty: 'Canada',
    center: [-68.0, 69.0],
    color: '#dc2626',
    seaArea: '~507,451',
    islandCount: '1',
    islands: [
      { nameKey: 'islands.baffinMain', coords: [-68.0, 69.0] },
      { nameKey: 'islands.iqaluit', coords: [-68.52, 63.75] },
    ]
  },
  queenElizabethIslands: {
    id: 'queen-elizabeth-islands',
    nameKey: 'islands.queenElizabethIslands',
    region: 'north_america',
    sovereignty: 'Canada',
    center: [-95.0, 78.0],
    color: '#b91c1c',
    seaArea: '~418,961',
    islandCount: '36',
    islands: [
      { nameKey: 'islands.ellesmerIsland', coords: [-80.0, 80.0] },
      { nameKey: 'islands.axelHeiberg', coords: [-90.0, 79.5] },
      { nameKey: 'islands.devonIsland', coords: [-86.0, 75.5] },
    ]
  },
  alexanderArchipelago: {
    id: 'alexander-archipelago',
    nameKey: 'islands.alexanderArchipelago',
    region: 'north_america',
    sovereignty: 'USA',
    center: [-134.0, 57.0],
    color: '#3b82f6',
    seaArea: '~35,000',
    islandCount: '1100+',
    islands: [
      { nameKey: 'islands.princeOfWales', coords: [-133.0, 55.5] },
      { nameKey: 'islands.baranof', coords: [-135.0, 57.0] },
      { nameKey: 'islands.chichagof', coords: [-135.5, 57.8] },
    ]
  },
  aleutianIslands: {
    id: 'aleutian-islands',
    nameKey: 'islands.aleutianIslands',
    region: 'north_america',
    sovereignty: 'USA',
    center: [-175.0, 52.0],
    color: '#2563eb',
    seaArea: '~17,666',
    islandCount: '300+',
    islands: [
      { nameKey: 'islands.unalaska', coords: [-166.5, 53.9] },
      { nameKey: 'islands.attu', coords: [172.9, 52.9] },
      { nameKey: 'islands.adak', coords: [-176.6, 51.9] },
    ]
  },

  // ==================== OCEANIA / AUSTRALIA ====================
  tasmania: {
    id: 'tasmania',
    nameKey: 'islands.tasmania',
    region: 'oceania',
    sovereignty: 'Australia',
    center: [146.5, -42.0],
    color: '#ec4899',
    seaArea: '~68,401',
    islandCount: '334',
    islands: [
      { nameKey: 'islands.tasmaniaMain', coords: [146.5, -42.0] },
      { nameKey: 'islands.hobart', coords: [147.33, -42.88] },
      { nameKey: 'islands.kingIsland', coords: [143.9, -39.9] },
      { nameKey: 'islands.flindersIsland', coords: [148.0, -40.0] },
    ]
  },
  torresStraitIslands: {
    id: 'torres-strait-islands',
    nameKey: 'islands.torresStraitIslands',
    region: 'oceania',
    sovereignty: 'Australia',
    center: [142.2, -10.0],
    color: '#f472b6',
    seaArea: '~48,000',
    islandCount: '274',
    islands: [
      { nameKey: 'islands.thursdayIsland', coords: [142.22, -10.58] },
      { nameKey: 'islands.hornIsland', coords: [142.29, -10.62] },
    ]
  },
  greatBarrierReef: {
    id: 'great-barrier-reef',
    nameKey: 'islands.greatBarrierReef',
    region: 'oceania',
    sovereignty: 'Australia',
    center: [146.0, -18.0],
    color: '#06b6d4',
    seaArea: '~344,400',
    islandCount: '900+',
    islands: [
      { nameKey: 'islands.whitsundayIsland', coords: [148.93, -20.25] },
      { nameKey: 'islands.hamiltonIsland', coords: [148.95, -20.35] },
      { nameKey: 'islands.lizardIsland', coords: [145.47, -14.67] },
    ]
  },
  papuaNewGuinea: {
    id: 'papua-new-guinea',
    nameKey: 'islands.papuaNewGuinea',
    region: 'oceania',
    sovereignty: 'Papua New Guinea',
    center: [147.0, -6.0],
    color: '#84cc16',
    seaArea: '~462,840',
    islandCount: '600+',
    islands: [
      { nameKey: 'islands.newBritain', coords: [150.5, -5.5] },
      { nameKey: 'islands.newIreland', coords: [152.0, -3.5] },
      { nameKey: 'islands.bougainville', coords: [155.5, -6.2] },
      { nameKey: 'islands.portMoresby', coords: [147.15, -9.45] },
    ]
  },

  // ==================== SOUTH AMERICA ====================
  tierraDelFuego: {
    id: 'tierra-del-fuego',
    nameKey: 'islands.tierraDelFuego',
    region: 'south_america',
    sovereignty: 'Argentina/Chile',
    center: [-68.5, -54.0],
    color: '#14b8a6',
    seaArea: '~48,100',
    islandCount: '20+',
    islands: [
      { nameKey: 'islands.islaGrande', coords: [-68.5, -54.0] },
      { nameKey: 'islands.ushuaia', coords: [-68.3, -54.8] },
      { nameKey: 'islands.navarino', coords: [-67.6, -55.1] },
    ]
  },
  chiloeArchipelago: {
    id: 'chiloe-archipelago',
    nameKey: 'islands.chiloeArchipelago',
    region: 'south_america',
    sovereignty: 'Chile',
    center: [-73.5, -42.5],
    color: '#0d9488',
    seaArea: '~9,181',
    islandCount: '40+',
    islands: [
      { nameKey: 'islands.chiloeIsland', coords: [-73.8, -42.5] },
      { nameKey: 'islands.castro', coords: [-73.77, -42.48] },
    ]
  },
  juanFernandezIslands: {
    id: 'juan-fernandez-islands',
    nameKey: 'islands.juanFernandezIslands',
    region: 'south_america',
    sovereignty: 'Chile',
    center: [-78.85, -33.6],
    color: '#10b981',
    seaArea: '~100',
    islandCount: '3',
    islands: [
      { nameKey: 'islands.robinsonCrusoe', coords: [-78.85, -33.65] },
      { nameKey: 'islands.alejandroSelkirk', coords: [-80.77, -33.77] },
    ]
  },
  falklandIslands: {
    id: 'falkland-islands',
    nameKey: 'islands.falklandIslands',
    region: 'south_america',
    sovereignty: 'UK',
    center: [-59.0, -51.75],
    color: '#3b82f6',
    seaArea: '~12,173',
    islandCount: '778',
    islands: [
      { nameKey: 'islands.eastFalkland', coords: [-58.5, -51.7] },
      { nameKey: 'islands.westFalkland', coords: [-60.0, -51.8] },
      { nameKey: 'islands.stanley', coords: [-57.85, -51.69] },
    ]
  },

  // ==================== AFRICA ====================
  saoTomePrincipe: {
    id: 'sao-tome-principe',
    nameKey: 'islands.saoTomePrincipe',
    region: 'africa',
    sovereignty: 'São Tomé and Príncipe',
    center: [6.73, 0.33],
    color: '#84cc16',
    seaArea: '~1,001',
    islandCount: '2',
    islands: [
      { nameKey: 'islands.saoTome', coords: [6.73, 0.33] },
      { nameKey: 'islands.principe', coords: [7.42, 1.62] },
    ]
  },
  bioko: {
    id: 'bioko',
    nameKey: 'islands.bioko',
    region: 'africa',
    sovereignty: 'Equatorial Guinea',
    center: [8.7, 3.5],
    color: '#65a30d',
    seaArea: '~2,017',
    islandCount: '1',
    islands: [
      { nameKey: 'islands.biokoMain', coords: [8.7, 3.5] },
      { nameKey: 'islands.malabo', coords: [8.78, 3.75] },
    ]
  },
  socotra: {
    id: 'socotra',
    nameKey: 'islands.socotra',
    region: 'africa',
    sovereignty: 'Yemen',
    center: [53.87, 12.5],
    color: '#eab308',
    seaArea: '~3,625',
    islandCount: '4',
    islands: [
      { nameKey: 'islands.socotraMain', coords: [53.87, 12.5] },
    ]
  },
  pembaZanzibar: {
    id: 'pemba-zanzibar',
    nameKey: 'islands.pembaZanzibar',
    region: 'africa',
    sovereignty: 'Tanzania',
    center: [39.5, -5.5],
    color: '#f59e0b',
    seaArea: '~2,643',
    islandCount: '50+',
    islands: [
      { nameKey: 'islands.zanzibarIsland', coords: [39.2, -6.15] },
      { nameKey: 'islands.pembaIsland', coords: [39.75, -5.0] },
      { nameKey: 'islands.stoneTown', coords: [39.19, -6.16] },
    ]
  },

  // ==================== MEDITERRANEAN (More) ====================
  dalmatianIslands: {
    id: 'dalmatian-islands',
    nameKey: 'islands.dalmatianIslands',
    region: 'europe',
    sovereignty: 'Croatia',
    center: [16.5, 43.5],
    color: '#6366f1',
    seaArea: '~2,500',
    islandCount: '1,246',
    islands: [
      { nameKey: 'islands.hvar', coords: [16.68, 43.17] },
      { nameKey: 'islands.brac', coords: [16.65, 43.32] },
      { nameKey: 'islands.korcula', coords: [17.13, 42.96] },
      { nameKey: 'islands.vis', coords: [16.18, 43.05] },
    ]
  },
  dodecanese: {
    id: 'dodecanese',
    nameKey: 'islands.dodecanese',
    region: 'europe',
    sovereignty: 'Greece',
    center: [27.0, 36.5],
    color: '#8b5cf6',
    seaArea: '~2,714',
    islandCount: '163',
    islands: [
      { nameKey: 'islands.rhodes', coords: [28.0, 36.44] },
      { nameKey: 'islands.kos', coords: [27.0, 36.88] },
      { nameKey: 'islands.patmos', coords: [26.55, 37.32] },
      { nameKey: 'islands.karpathos', coords: [27.15, 35.55] },
    ]
  },
  aegeanIslands: {
    id: 'aegean-islands',
    nameKey: 'islands.aegeanIslands',
    region: 'europe',
    sovereignty: 'Greece',
    center: [25.5, 37.5],
    color: '#a855f7',
    seaArea: '~9,122',
    islandCount: '2,000+',
    islands: [
      { nameKey: 'islands.lesbos', coords: [26.27, 39.17] },
      { nameKey: 'islands.chios', coords: [26.05, 38.37] },
      { nameKey: 'islands.samos', coords: [26.83, 37.75] },
    ]
  },
};

export const REGION_COLORS: Record<string, string> = {
  southeast_asia: '#dc2626',
  pacific: '#3b82f6',
  atlantic: '#f97316',
  indian: '#06b6d4',
  europe: '#6366f1',
  arctic: '#94a3b8',
  north_america: '#ef4444',
  south_america: '#14b8a6',
  africa: '#84cc16',
  oceania: '#ec4899',
  russia: '#f43f5e',
};

export const getArchipelagosByRegion = (region: string): Archipelago[] => {
  return Object.values(WORLD_ARCHIPELAGOS).filter(a => a.region === region);
};
