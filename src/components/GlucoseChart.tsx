import { useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
} from "chart.js";
import { GlucoseEntry } from "../types/types";
import annotationPlugin from "chartjs-plugin-annotation";

ChartJS.register(annotationPlugin);

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface GlucoseChartProps {
  entries: GlucoseEntry[];
}

// Chart configuration constants for better maintainability
const GLUCOSE_RANGES = {
  GOOD: {
    min: 0,
    max: 200,
    color: "rgba(0, 255, 0, 0.3)",
    borderColor: "rgba(0, 255, 0, 0.5)",
  },
  MODERATE: {
    min: 200,
    max: 280,
    color: "rgba(255, 255, 0, 0.3)",
    borderColor: "rgba(255, 255, 0, 0.5)",
  },
  HIGH: {
    min: 280,
    max: 500,
    color: "rgba(255, 0, 0, 0.3)",
    borderColor: "rgba(255, 0, 0, 0.5)",
  },
  DANGEROUS: {
    min: 500,
    max: 600,
    color: "rgba(139, 0, 0, 0.5)",
    borderColor: "rgba(139, 0, 0, 0.8)",
  },
} as const;

const GlucoseChart = ({ entries }: GlucoseChartProps) => {
  // Memoize chart data to prevent unnecessary recalculations
  const chartData = useMemo<ChartData<"line">>(
    () => ({
      labels: entries.map((entry) =>
        new Date(entry.timestamp).toLocaleString()
      ),
      datasets: [
        {
          label: "Glucose Level (mg/dL)",
          data: entries.map((entry) => entry.glucose),
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          fill: true,
          tension: 0.3, // Smooth line curves
        },
      ],
    }),
    [entries]
  );

  // Memoize chart options to prevent unnecessary recalculations
  const chartOptions = useMemo<ChartOptions<"line">>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          labels: {
            color: "white",
            font: {
              size: 14,
            },
          },
        },
        title: {
          display: true,
          text: "Glucose Levels Over Time",
          color: "white",
          font: {
            size: 18,
            weight: "bold",
          },
        },
        annotation: {
          annotations: {
            dangerous: {
              type: "box",
              yMin: GLUCOSE_RANGES.DANGEROUS.min,
              yMax: GLUCOSE_RANGES.DANGEROUS.max,
              backgroundColor: GLUCOSE_RANGES.DANGEROUS.color,
              borderColor: GLUCOSE_RANGES.DANGEROUS.borderColor,
              borderWidth: 2,
              label: {
                display: false,
              },
            },
            high: {
              type: "box",
              yMin: GLUCOSE_RANGES.HIGH.min,
              yMax: GLUCOSE_RANGES.HIGH.max,
              backgroundColor: GLUCOSE_RANGES.HIGH.color,
              borderColor: GLUCOSE_RANGES.HIGH.borderColor,
              borderWidth: 1,
              label: {
                display: true,
                content: "High (280-500)",
                position: "center",
                color: "white",
              },
            },
            moderate: {
              type: "box",
              yMin: GLUCOSE_RANGES.MODERATE.min,
              yMax: GLUCOSE_RANGES.MODERATE.max,
              backgroundColor: GLUCOSE_RANGES.MODERATE.color,
              borderColor: GLUCOSE_RANGES.MODERATE.borderColor,
              borderWidth: 1,
              label: {
                display: true,
                content: "Moderate (200-280)",
                position: "center",
                color: "black",
              },
            },
            good: {
              type: "box",
              yMin: GLUCOSE_RANGES.GOOD.min,
              yMax: GLUCOSE_RANGES.GOOD.max,
              backgroundColor: GLUCOSE_RANGES.GOOD.color,
              borderColor: GLUCOSE_RANGES.GOOD.borderColor,
              borderWidth: 1,
              label: {
                display: true,
                content: "Good (<200)",
                position: "center",
                color: "black",
              },
            },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: "white",
            maxRotation: 45,
            minRotation: 45,
          },
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
        },
        y: {
          ticks: {
            color: "white",
          },
          beginAtZero: true,
          grid: {
            color: "rgba(255, 255, 255, 0.2)",
          },
          afterDataLimits: (scale) => {
            scale.max = Math.max(300, scale.max);
          },
        },
      },
    }),
    []
  );

  return (
    <div
      className="w-full"
      style={{ minHeight: "300px", height: "50vh", maxHeight: "500px" }}
    >
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

export default GlucoseChart;
