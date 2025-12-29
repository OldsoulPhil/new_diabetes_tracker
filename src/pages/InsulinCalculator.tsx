import { Sidebar } from "../components/Sidebar";
import { InsulinCalculator as Calculator } from "../components/InsulinCalculator";

export const InsulinCalculatorPage = () => {
  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <div className="flex flex-1 flex-col bg-black text-white items-center justify-start p-4 md:p-8 overflow-auto pt-20 md:pt-4 md:ml-60">
        <div className="w-full max-w-6xl">
          <h1 className="text-2xl md:text-4xl font-bold mb-6 text-center">
            Insulin Dose Calculator
          </h1>
          <Calculator />
        </div>
      </div>
    </div>
  );
};
