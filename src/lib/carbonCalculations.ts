// Average CO2 absorption per tree per year (kg)
export const CO2_PER_TREE_PER_YEAR = 22;

// Average forest area per tree (m²)
export const FOREST_AREA_PER_TREE = 25;

export function calculateCO2Absorbed(treesPlanted: number): number {
  return treesPlanted * CO2_PER_TREE_PER_YEAR;
}

export function calculateForestArea(treesPlanted: number): number {
  return treesPlanted * FOREST_AREA_PER_TREE;
}

export function formatCO2(kg: number): string {
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(1)} tấn`;
  }
  return `${kg.toFixed(0)} kg`;
}

export function formatArea(m2: number): string {
  if (m2 >= 10000) {
    return `${(m2 / 10000).toFixed(2)} ha`;
  }
  return `${m2.toFixed(0)} m²`;
}

// Carbon footprint calculation based on daily activities
export interface CarbonInput {
  transportation: {
    carKm: number;
    motorbikeKm: number;
    busKm: number;
    flightHours: number;
  };
  energy: {
    electricityKwh: number;
    gasM3: number;
  };
  diet: 'vegan' | 'vegetarian' | 'mixed' | 'meat_heavy';
}

// CO2 emissions in kg per unit
const EMISSION_FACTORS = {
  car: 0.21, // kg CO2 per km
  motorbike: 0.1, // kg CO2 per km
  bus: 0.089, // kg CO2 per km
  flight: 90, // kg CO2 per hour
  electricity: 0.5, // kg CO2 per kWh (Vietnam average)
  gas: 2.0, // kg CO2 per m³
  diet: {
    vegan: 2.5, // kg CO2 per day
    vegetarian: 3.5,
    mixed: 5.0,
    meat_heavy: 7.5,
  },
};

export function calculateDailyCarbonFootprint(input: CarbonInput): number {
  const transportEmissions = 
    input.transportation.carKm * EMISSION_FACTORS.car +
    input.transportation.motorbikeKm * EMISSION_FACTORS.motorbike +
    input.transportation.busKm * EMISSION_FACTORS.bus +
    input.transportation.flightHours * EMISSION_FACTORS.flight;

  const energyEmissions = 
    input.energy.electricityKwh * EMISSION_FACTORS.electricity +
    input.energy.gasM3 * EMISSION_FACTORS.gas;

  const dietEmissions = EMISSION_FACTORS.diet[input.diet];

  return transportEmissions + energyEmissions + dietEmissions;
}

export function calculateYearlyCarbonFootprint(dailyCO2: number): number {
  return dailyCO2 * 365;
}

export function calculateTreesNeededToOffset(yearlyCO2: number): number {
  return Math.ceil(yearlyCO2 / CO2_PER_TREE_PER_YEAR);
}

export function getCarbonLevel(yearlyCO2: number): 'low' | 'medium' | 'high' | 'very_high' {
  if (yearlyCO2 < 2000) return 'low';
  if (yearlyCO2 < 4000) return 'medium';
  if (yearlyCO2 < 8000) return 'high';
  return 'very_high';
}

export function getCarbonLevelColor(level: 'low' | 'medium' | 'high' | 'very_high'): string {
  switch (level) {
    case 'low': return 'text-green-500';
    case 'medium': return 'text-yellow-500';
    case 'high': return 'text-orange-500';
    case 'very_high': return 'text-red-500';
  }
}
