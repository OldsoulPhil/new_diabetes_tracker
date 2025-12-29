import { useState, useCallback, ChangeEvent } from "react";
import { calculateTotalInsulinDose } from "../utils/insulinCalculations";

export const InsulinCalculator = () => {
  // User settings (to be configured by user with their doctor)
  const [icRatio, setIcRatio] = useState<string>("15"); // Carbs covered by 1 unit
  const [correctionFactor, setCorrectionFactor] = useState<string>("50"); // ISF (mg/dL per unit)
  const [targetGlucose, setTargetGlucose] = useState<string>("120"); // Target glucose mg/dL

  // Current meal/reading inputs
  const [currentGlucose, setCurrentGlucose] = useState<string>("");
  const [carbsToEat, setCarbsToEat] = useState<string>("");

  // Calculation results
  const [carbDose, setCarbDose] = useState<number | null>(null);
  const [correctionDose, setCorrectionDose] = useState<number | null>(null);
  const [totalDose, setTotalDose] = useState<number | null>(null);

  // Settings panel visibility
  const [showSettings, setShowSettings] = useState<boolean>(false);

  const calculateDose = useCallback(() => {
    const glucose = currentGlucose ? parseFloat(currentGlucose) : null;
    const carbs = parseFloat(carbsToEat);
    const ratio = parseFloat(icRatio);
    const isf = parseFloat(correctionFactor);
    const target = parseFloat(targetGlucose);

    const result = calculateTotalInsulinDose(carbs, glucose, {
      icRatio: ratio,
      correctionFactor: isf,
      targetGlucose: target,
    });

    if (result) {
      setCarbDose(result.carbDose);
      setCorrectionDose(result.correctionDose);
      setTotalDose(result.totalDose);
    } else {
      setCarbDose(null);
      setCorrectionDose(null);
      setTotalDose(null);
    }
  }, [currentGlucose, carbsToEat, icRatio, correctionFactor, targetGlucose]);

  const resetCalculator = useCallback(() => {
    setCurrentGlucose("");
    setCarbsToEat("");
    setCarbDose(null);
    setCorrectionDose(null);
    setTotalDose(null);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto p-4 md:p-6 bg-gradient-to-br from-purple-900 to-indigo-900 text-white rounded-lg shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          💉 Insulin Dose Calculator
        </h2>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="bg-white text-purple-900 px-3 py-1 rounded-lg text-sm font-semibold hover:bg-gray-100 transition"
        >
          ⚙️ Settings
        </button>
      </div>

      <div className="bg-yellow-600 text-black p-3 rounded-lg mb-4 text-sm">
        <strong>⚠️ Medical Disclaimer:</strong> This calculator is for
        educational purposes only. Always consult with your healthcare provider
        before making insulin dosing decisions.
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-indigo-800 p-4 rounded-lg mb-4 space-y-3">
          <h3 className="font-semibold text-lg mb-3">
            Your Insulin Settings (Set with your doctor)
          </h3>

          <div>
            <label className="block text-sm font-medium mb-1">
              Insulin-to-Carb Ratio (I:C) - Carbs per 1 unit
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm">1 unit covers</span>
              <input
                type="number"
                value={icRatio}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setIcRatio(e.target.value)
                }
                className="border rounded-lg p-2 text-black w-20"
                min="1"
                step="0.5"
              />
              <span className="text-sm">grams of carbs</span>
            </div>
            <p className="text-xs text-gray-300 mt-1">
              Example: If 1:15, then 1 unit covers 15g carbs
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Correction Factor (ISF) - mg/dL per unit
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm">1 unit lowers glucose by</span>
              <input
                type="number"
                value={correctionFactor}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setCorrectionFactor(e.target.value)
                }
                className="border rounded-lg p-2 text-black w-20"
                min="1"
              />
              <span className="text-sm">mg/dL</span>
            </div>
            <p className="text-xs text-gray-300 mt-1">
              Example: If 50, then 1 unit drops glucose by 50 mg/dL
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Target Blood Glucose (mg/dL)
            </label>
            <input
              type="number"
              value={targetGlucose}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setTargetGlucose(e.target.value)
              }
              className="border rounded-lg p-2 text-black w-32"
              min="70"
              max="180"
            />
            <p className="text-xs text-gray-300 mt-1">
              Typical range: 100-120 mg/dL
            </p>
          </div>
        </div>
      )}

      {/* Calculator Inputs */}
      <div className="space-y-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Current Blood Glucose (mg/dL) - Optional
          </label>
          <input
            type="number"
            value={currentGlucose}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setCurrentGlucose(e.target.value)
            }
            placeholder="e.g., 180"
            className="border rounded-lg p-3 text-black w-full"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Carbohydrates to Eat (grams) - Required
          </label>
          <input
            type="number"
            value={carbsToEat}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setCarbsToEat(e.target.value)
            }
            placeholder="e.g., 60"
            className="border rounded-lg p-3 text-black w-full"
            min="0"
            required
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={calculateDose}
          className="flex-1 bg-orange-600 text-white rounded-lg px-4 py-3 font-semibold hover:bg-orange-700 transition disabled:opacity-50"
          disabled={!carbsToEat}
        >
          Calculate Dose
        </button>
        <button
          onClick={resetCalculator}
          className="bg-gray-600 text-white rounded-lg px-4 py-3 font-semibold hover:bg-gray-700 transition"
        >
          Reset
        </button>
      </div>

      {/* Results Display */}
      {totalDose !== null && (
        <div className="bg-white text-black p-4 rounded-lg space-y-3">
          <h3 className="font-bold text-lg border-b pb-2">
            Calculated Insulin Dose
          </h3>

          <div className="space-y-2">
            {carbDose !== null && (
              <div className="flex justify-between items-center">
                <span className="text-sm">
                  Carb Coverage Dose:
                  <br />
                  <span className="text-xs text-gray-600">
                    ({carbsToEat}g ÷ {icRatio} = {carbDose.toFixed(2)})
                  </span>
                </span>
                <span className="font-bold text-lg">
                  {carbDose.toFixed(1)} units
                </span>
              </div>
            )}

            {correctionDose !== null && correctionDose > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm">
                  Correction Dose:
                  <br />
                  <span className="text-xs text-gray-600">
                    (({currentGlucose} - {targetGlucose}) ÷ {correctionFactor} ={" "}
                    {correctionDose.toFixed(2)})
                  </span>
                </span>
                <span className="font-bold text-lg">
                  {correctionDose.toFixed(1)} units
                </span>
              </div>
            )}

            <div className="border-t-2 border-gray-300 pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-lg">
                  Total Insulin Dose:
                </span>
                <span className="font-bold text-2xl text-orange-600">
                  {totalDose.toFixed(1)} units
                </span>
              </div>
            </div>
          </div>

          <div className="bg-blue-100 p-3 rounded text-sm mt-3">
            <strong>💡 Tip:</strong> Round to the nearest 0.5 units based on
            your insulin pen/pump increment. Always verify with your healthcare
            provider.
          </div>
        </div>
      )}

      {/* Formula Reference */}
      <details className="mt-4 text-sm">
        <summary className="cursor-pointer font-semibold hover:text-gray-300">
          📖 How It Works (Click to expand)
        </summary>
        <div className="mt-2 space-y-2 text-xs bg-indigo-800 p-3 rounded">
          <p>
            <strong>Carb Coverage:</strong> Total carbs ÷ I:C ratio
          </p>
          <p>
            <strong>Correction:</strong> (Current glucose - Target glucose) ÷
            ISF
          </p>
          <p>
            <strong>Total:</strong> Carb Coverage + Correction
          </p>
          <p className="text-gray-300 mt-2">
            Your doctor determines your I:C ratio and ISF based on your body's
            insulin sensitivity. These settings may change over time.
          </p>
        </div>
      </details>
    </div>
  );
};
