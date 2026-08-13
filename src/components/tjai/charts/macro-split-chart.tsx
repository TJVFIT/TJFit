"use client";

import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

type Props = {
  protein: number;
  carbs: number;
  fat: number;
};

export default function MacroSplitChart({ protein, carbs, fat }: Props) {
  const pieData = {
    labels: ["Protein", "Carbs", "Fat"],
    datasets: [{ data: [protein * 4, carbs * 4, fat * 9], backgroundColor: ["#A855F7", "#7C3AED", "rgba(255,255,255,0.35)"], borderWidth: 0 }]
  };

  return (
    <Doughnut
      data={pieData}
      options={{ maintainAspectRatio: false, plugins: { legend: { labels: { color: "#A1A1AA" } } } }}
    />
  );
}
