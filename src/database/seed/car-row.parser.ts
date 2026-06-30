function toNumber(value: string | undefined): number | null {
  if (!value) return null;
  const cleaned = value.replace(/[^0-9.]/g, '');
  if (!cleaned) return null;
  const num = Number(cleaned);
  return Number.isNaN(num) ? null : num;
}

function firstNumber(value: string | undefined): number | null {
  if (!value) return null;
  const match = value.match(/[\d.]+/);
  return match ? toNumber(match[0]) : null;
}

function toPriceInr(value: string | undefined): number | null {
  if (!value) return null;
  const digitsOnly = value.replace(/[^0-9]/g, '');
  if (!digitsOnly) return null;
  const num = Number(digitsOnly);
  return Number.isNaN(num) ? null : num;
}

export interface ParsedCar {
  make: string;
  model: string;
  variant: string;
  priceInr: number | null;
  fuelType: string | null;
  bodyType: string | null;
  transmission: string | null;
  seatingCapacity: number | null;
  doors: number | null;
  displacementCc: number | null;
  cityMileageKmpl: number | null;
  highwayMileageKmpl: number | null;
  powerRaw: string | null;
  torqueRaw: string | null;
  drivetrain: string | null;
  specs: Record<string, string>;
}

export function parseCarRow(row: Record<string, string>): ParsedCar | null {
  const make = row['Make']?.trim();
  const model = row['Model']?.trim();
  const variant = row['Variant']?.trim();
  if (!make || !model || !variant) return null;

  return {
    make,
    model,
    variant,
    priceInr: toPriceInr(row['Ex-Showroom_Price']),
    fuelType: row['Fuel_Type']?.trim() || null,
    bodyType: row['Body_Type']?.trim() || null,
    transmission: row['Type']?.trim() || null,
    seatingCapacity: firstNumber(row['Seating_Capacity']),
    doors: firstNumber(row['Doors']),
    displacementCc: firstNumber(row['Displacement']),
    cityMileageKmpl: firstNumber(row['City_Mileage']),
    highwayMileageKmpl: firstNumber(row['Highway_Mileage']),
    powerRaw: row['Power']?.trim() || null,
    torqueRaw: row['Torque']?.trim() || null,
    drivetrain: row['Drivetrain']?.trim() || null,
    specs: row,
  };
}
