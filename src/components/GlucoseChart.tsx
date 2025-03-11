import React from "react";
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

const GlucoseChart: React.FC<GlucoseChartProps> = ({ entries }) => {
  const data = {
    labels: entries.map((entry) => new Date(entry.timestamp).toLocaleString()),
    datasets: [
      {
        label: "Glucose Level (mg/dL)",
        data: entries.map((entry) => entry.glucose),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "white", // Make legend text white
        },
      },
      title: {
        display: true,
        text: "Glucose Levels Over Time",
        color: "white", // Make title text white
      },
    },
    scales: {
      x: {
        ticks: {
          color: "white", // Make x-axis labels white
        },
      },
      y: {
        ticks: {
          color: "white", // Make y-axis labels white
        },
        beginAtZero: true,
        grid: {
          color: "rgba(255, 255, 255, 0.2)", // Make grid lines lighter
        },
        afterDataLimits: (scale: { max: number }) => {
          scale.max = Math.max(300, scale.max); // Ensure the y-axis goes up to at least 300
        },
      },
    },
    annotation: {
      annotations: {
        high: {
          type: "box",
          yMin: 280,
          yMax: 500,
          backgroundColor: "rgba(255, 0, 0, 0.3)",
          borderColor: "rgba(255, 0, 0, 0.5)",
          borderWidth: 1,
          label: {
            content: "High (>280)",
            enabled: true,
            position: "center",
            color: "white",
          },
        },
        moderate: {
          type: "box",
          yMin: 200,
          yMax: 280,
          backgroundColor: "rgba(255, 255, 0, 0.3)",
          borderColor: "rgba(255, 255, 0, 0.5)",
          borderWidth: 1,
          label: {
            content: "Moderate (200-280)",
            enabled: true,
            position: "center",
            color: "black",
          },
        },
        good: {
          type: "box",
          yMin: 0,
          yMax: 200,
          backgroundColor: "rgba(0, 255, 0, 0.3)",
          borderColor: "rgba(0, 255, 0, 0.5)",
          borderWidth: 1,
          label: {
            content: "Good (<200)",
            enabled: true,
            position: "center",
            color: "black",
          },
        },
      },
    },
  };

  return <Line data={data} options={options} />;
};

export default GlucoseChart;
