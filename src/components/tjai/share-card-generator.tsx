"use client";

import { useRef, useState } from "react";

export function ShareCardGenerator({
  goal,
  calories,
  protein,
  duration
}: {
  goal: string;
  calories: number;
  protein: number;
  duration: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [format, setFormat] = useState<"stories" | "square">("stories");

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dims = format === "stories" ? { w: 1080, h: 1920 } : { w: 1080, h: 1080 };
    canvas.width = dims.w;
    canvas.height = dims.h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#09090B";
    ctx.fillRect(0, 0, dims.w, dims.h);
    const grad = ctx.createRadialGradient(dims.w / 2, 120, 100, dims.w / 2, 120, 600);
    grad.addColorStop(0, "rgba(34,211,238,0.15)");
    grad.addColorStop(1, "rgba(34,211,238,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, dims.w, dims.h);

    ctx.fillStyle = "#22D3EE";
    ctx.font = "700 30px Inter, Arial";
    ctx.textAlign = "center";
    ctx.fillText("MY TJAI PLAN", dims.w / 2, 260);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "800 72px Inter, Arial";
    ctx.fillText(goal.toUpperCase(), dims.w / 2, 360);

    const cards = [`${calories} kcal/day`, `${protein}g protein`, duration];
    cards.forEach((text, i) => {
      const x = dims.w / 2 - 360 + i * 240;
      ctx.fillStyle = "#111215";
      ctx.fillRect(x, 460, 220, 120);
      ctx.strokeStyle = "#1E2028";
      ctx.strokeRect(x, 460, 220, 120);
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "600 28px Inter, Arial";
      ctx.fillText(text, x + 110, 530);
    });

    ctx.strokeStyle = "#22D3EE";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(dims.w / 2 - 260, 640);
    ctx.lineTo(dims.w / 2 + 260, 640);
    ctx.stroke();

    ctx.fillStyle = "#A1A1AA";
    ctx.font = "500 30px Inter, Arial";
    ctx.fillText("Personalized by TJAI — TJFit AI Coach", dims.w / 2, 720);
    ctx.fillText("Create your plan at tjfit.org/ai", dims.w / 2, dims.h - 120);
  };

  const download = () => {
    draw();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `tjai-share-card-${format}.png`;
    a.click();
  };

  const copyImage = async () => {
    draw();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob((b) => resolve(b), "image/png"));
    if (!blob || !("ClipboardItem" in window)) return;
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
  };

  return (
    <div className="rounded-xl border border-[#1E2028] bg-[#111215] p-5">
      <h3 className="text-lg font-semibold text-white">Share Your Plan</h3>
      <div className="mt-3 flex gap-2">
        <button type="button" onClick={() => setFormat("stories")} className={`rounded-full border px-3 py-1 text-xs ${format === "stories" ? "border-[#22D3EE] text-white" : "border-[#1E2028] text-[#A1A1AA]"}`}>
          Stories
        </button>
        <button type="button" onClick={() => setFormat("square")} className={`rounded-full border px-3 py-1 text-xs ${format === "square" ? "border-[#22D3EE] text-white" : "border-[#1E2028] text-[#A1A1AA]"}`}>
          Square
        </button>
      </div>
      <div className="mt-4 flex gap-2">
        <button type="button" onClick={download} className="rounded-full bg-[#22D3EE] px-4 py-2 text-sm font-semibold text-[#09090B]">
          Download Card
        </button>
        <button type="button" onClick={() => void copyImage()} className="rounded-full border border-[#1E2028] px-4 py-2 text-sm text-[#A1A1AA]">
          Copy Image
        </button>
      </div>
      <canvas ref={canvasRef} className="mt-4 h-0 w-0 opacity-0" />
    </div>
  );
}

