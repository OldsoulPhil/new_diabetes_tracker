/**
 * Insulin calculation utilities
 */

export interface InsulinSettings {
  icRatio: number; // Insulin-to-Carb ratio
  correctionFactor: number; // ISF
  targetGlucose: number;
}

export interface InsulinDoseResult {
  carbDose: number;
  correctionDose: number;
  totalDose: number;
}

/**
 * Calculate carbohydrate coverage dose
 * Formula: Total carbs ÷ I:C ratio
 */
export const calculateCarbDose = (carbs: number, icRatio: number): number => {
  if (isNaN(carbs) || isNaN(icRatio) || icRatio === 0) {
    return 0;
  }
  return carbs / icRatio;
};

/**
 * Calculate correction dose for high blood glucose
 * Formula: (Current glucose - Target glucose) ÷ ISF
 */
export const calculateCorrectionDose = (
  currentGlucose: number,
  targetGlucose: number,
  correctionFactor: number
): number => {
  if (
    isNaN(currentGlucose) ||
    isNaN(targetGlucose) ||
    isNaN(correctionFactor) ||
    correctionFactor === 0
  ) {
    return 0;
  }

  const glucoseDifference = currentGlucose - targetGlucose;

  // Only apply correction if glucose is above target
  if (glucoseDifference <= 0) {
    return 0;
  }

  return glucoseDifference / correctionFactor;
};

/**
 * Calculate total insulin dose
 * Combines carb coverage and correction doses
 */
export const calculateTotalInsulinDose = (
  carbs: number,
  currentGlucose: number | null,
  settings: InsulinSettings
): InsulinDoseResult | null => {
  const { icRatio, correctionFactor, targetGlucose } = settings;

  // Validate minimum required inputs
  if (isNaN(carbs) || isNaN(icRatio) || icRatio === 0) {
    return null;
  }

  const carbDose = calculateCarbDose(carbs, icRatio);

  const correctionDose =
    currentGlucose !== null
      ? calculateCorrectionDose(currentGlucose, targetGlucose, correctionFactor)
      : 0;

  return {
    carbDose,
    correctionDose,
    totalDose: carbDose + correctionDose,
  };
};

/**
 * Validate insulin settings
 */
export const validateInsulinSettings = (
  settings: InsulinSettings
): string | null => {
  if (settings.icRatio <= 0) {
    return "I:C ratio must be greater than 0";
  }
  if (settings.correctionFactor <= 0) {
    return "Correction factor must be greater than 0";
  }
  if (settings.targetGlucose < 70 || settings.targetGlucose > 180) {
    return "Target glucose should be between 70-180 mg/dL";
  }
  return null;
};
