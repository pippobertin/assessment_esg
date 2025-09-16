export interface EmissionFactor {
  source: string;
  unit: string;
  co2_kg_per_unit: number;
  description: string;
}

export const emissionFactors: Record<string, EmissionFactor> = {
  electricity_italy: {
    source: "Electricity (Italy)",
    unit: "kWh",
    co2_kg_per_unit: 0.233,
    description: "Fattore di emissione per l'energia elettrica in Italia"
  },
  natural_gas: {
    source: "Natural Gas",
    unit: "m³",
    co2_kg_per_unit: 1.978,
    description: "Fattore di emissione per il gas naturale"
  },
  diesel: {
    source: "Diesel",
    unit: "L",
    co2_kg_per_unit: 2.68,
    description: "Fattore di emissione per il gasolio"
  },
  gasoline: {
    source: "Gasoline",
    unit: "L",
    co2_kg_per_unit: 2.31,
    description: "Fattore di emissione per la benzina"
  },
  paper: {
    source: "Paper",
    unit: "kg",
    co2_kg_per_unit: 0.91,
    description: "Fattore di emissione per la carta"
  },
  water: {
    source: "Water",
    unit: "m³",
    co2_kg_per_unit: 0.149,
    description: "Fattore di emissione per l'acqua"
  },
  flight_domestic: {
    source: "Domestic Flight",
    unit: "km",
    co2_kg_per_unit: 0.255,
    description: "Fattore di emissione per voli domestici per passeggero"
  },
  flight_international: {
    source: "International Flight",
    unit: "km",
    co2_kg_per_unit: 0.195,
    description: "Fattore di emissione per voli internazionali per passeggero"
  },
  waste_mixed: {
    source: "Mixed Waste",
    unit: "kg",
    co2_kg_per_unit: 0.461,
    description: "Fattore di emissione per rifiuti misti non differenziati"
  },
  waste_recycled: {
    source: "Recycled Waste",
    unit: "kg",
    co2_kg_per_unit: 0.058,
    description: "Fattore di emissione per rifiuti differenziati/riciclabili"
  },
  waste_organic: {
    source: "Organic Waste",
    unit: "kg",
    co2_kg_per_unit: 0.089,
    description: "Fattore di emissione per rifiuti organici"
  }
};

export interface CalculationResult {
  input_value: number;
  input_unit: string;
  co2_kg: number;
  co2_tonnes: number;
  factor_used: EmissionFactor;
}

export function calculateCO2Emissions(
  value: number, 
  factorKey: string
): CalculationResult | null {
  const factor = emissionFactors[factorKey];
  
  if (!factor || value < 0) {
    return null;
  }
  
  const co2_kg = value * factor.co2_kg_per_unit;
  
  return {
    input_value: value,
    input_unit: factor.unit,
    co2_kg,
    co2_tonnes: co2_kg / 1000,
    factor_used: factor
  };
}

export function calculateEnergyEmissions(
  electricityKwh: number,
  gasM3: number,
  dieselL: number,
  gasolineL: number,
  renewablePercentage?: number
): CalculationResult[] {
  const calculations: CalculationResult[] = [];

  if (electricityKwh > 0) {
    let calc = calculateCO2Emissions(electricityKwh, 'electricity_italy');
    if (calc && renewablePercentage !== undefined) {
      // Riduce le emissioni in base alla percentuale di fonti rinnovabili
      const reductionFactor = renewablePercentage / 100;
      calc.co2_kg = calc.co2_kg * (1 - reductionFactor);
      calc.co2_tonnes = calc.co2_kg / 1000;
      calc.factor_used = {
        ...calc.factor_used,
        co2_kg_per_unit: calc.factor_used.co2_kg_per_unit * (1 - reductionFactor),
        description: `${calc.factor_used.description} (ridotto del ${renewablePercentage}% per fonti rinnovabili)`
      };
    }
    if (calc) calculations.push(calc);
  }
  
  if (gasM3 > 0) {
    const calc = calculateCO2Emissions(gasM3, 'natural_gas');
    if (calc) calculations.push(calc);
  }
  
  if (dieselL > 0) {
    const calc = calculateCO2Emissions(dieselL, 'diesel');
    if (calc) calculations.push(calc);
  }
  
  if (gasolineL > 0) {
    const calc = calculateCO2Emissions(gasolineL, 'gasoline');
    if (calc) calculations.push(calc);
  }
  
  return calculations;
}

export function getTotalEmissions(calculations: CalculationResult[]): number {
  return calculations.reduce((total, calc) => total + calc.co2_tonnes, 0);
}

export function formatEmissions(tonnes: number): string {
  if (tonnes < 0.001) {
    return `${(tonnes * 1000000).toFixed(0)} g CO₂eq`;
  } else if (tonnes < 1) {
    return `${(tonnes * 1000).toFixed(1)} kg CO₂eq`;
  } else {
    return `${tonnes.toFixed(2)} t CO₂eq`;
  }
}

export function calculateWasteEmissions(
  wasteKg: number,
  wasteManagementLevel?: string
): CalculationResult | null {
  if (wasteKg <= 0) return null;

  let factorKey = 'waste_mixed'; // Default: rifiuti misti

  if (wasteManagementLevel) {
    switch (wasteManagementLevel) {
      case 'Sì, con obiettivi di riduzione':
        factorKey = 'waste_organic'; // Migliore gestione
        break;
      case 'Sì, raccolta differenziata':
        factorKey = 'waste_recycled'; // Differenziata
        break;
      case 'Parzialmente':
        // Media tra mixed e recycled
        const mixedCalc = calculateCO2Emissions(wasteKg, 'waste_mixed');
        const recycledCalc = calculateCO2Emissions(wasteKg, 'waste_recycled');
        if (mixedCalc && recycledCalc) {
          const avgEmission = (mixedCalc.co2_kg + recycledCalc.co2_kg) / 2;
          return {
            input_value: wasteKg,
            input_unit: 'kg',
            co2_kg: avgEmission,
            co2_tonnes: avgEmission / 1000,
            factor_used: {
              source: "Mixed/Recycled Waste (Average)",
              unit: "kg",
              co2_kg_per_unit: avgEmission / wasteKg,
              description: "Fattore medio per gestione parziale dei rifiuti"
            }
          };
        }
        break;
      case 'No':
      default:
        factorKey = 'waste_mixed'; // Peggiore gestione
        break;
    }
  }

  return calculateCO2Emissions(wasteKg, factorKey);
}

export function getRenewablePercentageFromAnswer(answer: string): number {
  switch (answer) {
    case 'Sì, oltre 80%':
      return 85; // Media dell'intervallo 80-100%
    case 'Parzialmente (30-80%)':
      return 55; // Media dell'intervallo 30-80%
    case 'Poco (10-30%)':
      return 20; // Media dell'intervallo 10-30%
    case 'No, meno del 10%':
    case 'Non so':
    default:
      return 5; // Valore conservativo per <10%
  }
}