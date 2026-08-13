"use client";

import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

type Props = {
  labels: string[];
  projected: number[];
  noAction: number[];
};

export default function TransformationForecastChart({ labels, projected, noAction }: Props) {
  const lineData = {
    labels,
    datasets: [
      { label: "Projected", data: projected, borderColor: "#A855F7", backgroundColor: "rgba(168,85,247,0.12)", tension: 0.35, fill: true },
      { label: "No action", data: noAction, borderColor: "rgba(239,68,68,0.4)", borderDash: [6, 6], tension: 0.2 }
    ]
  };

  return (
    <Line
      data={lineData}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: "#A1A1AA" } } },
        scales: {
          x: { ticks: { color: "#52525B" }, grid: { color: "rgba(255,255,255,0.04)" } },
          y: { ticks: { color: "#52525B" }, grid: { color: "rgba(255,255,255,0.04)" } }
        }
      }}
    />
  );
}
