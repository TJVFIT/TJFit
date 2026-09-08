import { useId } from "react";

import type { ProductId } from "@/lib/store/catalog";

export function EquipmentVisual({ product, hero = false }: { product: ProductId; hero?: boolean }) {
  const id = useId().replace(/:/g, "");
  const metal = `url(#metal-${id})`;
  const rubber = `url(#rubber-${id})`;
  const isStrength = ["multi-press", "lat-row", "leg", "pec", "hip"].includes(product);

  return (
    <svg viewBox="0 0 400 300" fill="none" aria-hidden="true" focusable="false" className="h-full w-full">
      <defs>
        <linearGradient id={`metal-${id}`} x1="80" y1="80" x2="240" y2="270" gradientUnits="userSpaceOnUse">
          <stop stopColor="#D4D4D8" />
          <stop offset="0.35" stopColor="#52525B" />
          <stop offset="0.6" stopColor="#A1A1AA" />
          <stop offset="1" stopColor="#3F3F46" />
        </linearGradient>
        <linearGradient id={`rubber-${id}`} x1="110" y1="90" x2="250" y2="230" gradientUnits="userSpaceOnUse">
          <stop stopColor="#52525B" />
          <stop offset="0.42" stopColor="#27272A" />
          <stop offset="1" stopColor="#18181B" />
        </linearGradient>
      </defs>
      <ellipse cx="205" cy="262" rx={hero ? 160 : 134} ry="12" fill="#09090B" opacity="0.65" />
      {product === "dumbbells" && (
        <g transform={hero ? "translate(-26 -12) rotate(-18 200 150) scale(1.12)" : "rotate(-16 200 150)"}>
          <g opacity="0.6" transform="translate(70 -28) scale(.8)">
            <rect x="137" y="145" width="133" height="26" rx="9" fill={metal} />
            <path d="m107 112 33-16 35 17v85l-35 17-33-16z" fill={rubber} stroke="#71717A" />
            <path d="m262 111 32-15 34 17v85l-34 16-32-16z" fill={rubber} stroke="#71717A" />
          </g>
          <rect x="106" y="165" width="165" height="30" rx="10" fill={metal} />
          {Array.from({ length: 13 }, (_, i) => <path key={i} d={`m${148 + i * 5} 166-8 28`} stroke="#27272A" strokeWidth="1.5" opacity="0.7" />)}
          <path d="m78 115 39-17 40 20v112l-40 21-39-21z" fill={rubber} stroke="#52525B" strokeWidth="2" />
          <path d="m78 115 39 22 40-19M117 137v114" stroke="#71717A" strokeWidth="2" />
          <path d="m238 112 39-17 41 22v112l-41 21-39-21z" fill={rubber} stroke="#71717A" strokeWidth="2" />
          <path d="m238 112 39 23 41-18M277 135v115" stroke="#71717A" strokeWidth="2" />
          <path d="m88 135 18 10v81l-18-11zM287 144l19-10v83l-19 10z" fill="#C4B5FD" opacity="0.7" />
        </g>
      )}
      {product === "treadmill" && (
        <g strokeLinejoin="round">
          <path d="m49 222 178 28 123-66-173-27z" fill="#27272A" stroke={metal} strokeWidth="7" />
          <path d="m77 216 145 22 97-51-142-20z" fill="#111215" stroke="#52525B" strokeWidth="2" />
          {Array.from({ length: 7 }, (_, i) => <path key={i} d={`m${92 + i * 15} ${208 - i * 7} 141 21`} stroke="#27272A" strokeWidth="2" />)}
          <path d="m83 218 6-108 114 15 9 112M277 207l-12-114" stroke={metal} strokeWidth="10" />
          <path d="m88 111 97-48 84 19-68 45z" fill="#27272A" stroke="#71717A" strokeWidth="4" />
          <path d="m123 105 62-30 46 10-58 30z" fill="#18181B" stroke="#C4B5FD" strokeWidth="2" />
          <path d="m89 112-37 21m150-7 49 16" stroke="#71717A" strokeWidth="9" strokeLinecap="round" />
          <path d="m54 232 170 27 119-66" stroke="#C4B5FD" strokeWidth="3" opacity="0.55" />
        </g>
      )}
      {product === "bench" && (
        <g strokeLinejoin="round">
          <path d="m91 249 73-99 94 106m-63-66 44-81M61 253l73-6m91 11 74-5" stroke={metal} strokeWidth="10" strokeLinecap="round" />
          <path d="m166 165 59-100 55 18-59 103z" fill={rubber} stroke="#71717A" strokeWidth="3" />
          <path d="m102 191 63-31 52 28-63 31z" fill="#27272A" stroke="#71717A" strokeWidth="3" />
          <path d="m185 158 43-72 17 5-43 73" stroke="#C4B5FD" strokeWidth="2" opacity="0.7" />
          <circle cx="173" cy="177" r="6" fill="#C4B5FD" />
        </g>
      )}
      {product === "rack" && (
        <g strokeLinejoin="round">
          <path d="m91 244 18-137 193-27 23 145M72 250l58-10m168-6 47-13" stroke={metal} strokeWidth="9" strokeLinecap="round" />
          {[118, 166, 214].map((y) => (
            <g key={y}>
              <path d={`m89 ${y} 210-32 29 18-211 34z`} fill="#27272A" stroke="#71717A" strokeWidth="3" />
              {[0, 1, 2, 3, 4, 5].map((n) => <path key={n} d={`m${109 + n * 30} ${y - n * 4.5 - 6} 7-6 8 4v12l-7 5-8-4z`} fill={rubber} stroke="#A1A1AA" strokeWidth="1.5" />)}
            </g>
          ))}
          <path d="m91 245 231-31" stroke="#C4B5FD" strokeWidth="2" />
        </g>
      )}
      {isStrength && (
        <g strokeLinecap="round" strokeLinejoin="round">
          <path d="M249 244V62l63-16v182l-63 16Z" fill="#18181B" stroke="#52525B" strokeWidth="3" />
          <path d="M257 239V74l44-12v164l-44 13Z" fill="#27272A" />
          {Array.from({ length: 10 }, (_, i) => <path key={i} d={`m260 ${131 + i * 9} 36-10`} stroke="#52525B" strokeWidth="4" />)}
          <path d="m252 245-107 10-63-14M143 253l22-70M308 230l24 6M250 68l-57-17-60 26v105" stroke={metal} strokeWidth="8" />
          <path d="m137 171 27-12 31 8-25 14zM137 172v14l33 10 26-14v-15" fill={rubber} stroke="#71717A" strokeWidth="2" />
          <path d="m157 143 7-55 25 4-4 61-28-10Z" fill={rubber} stroke="#71717A" strokeWidth="2" />
          <path d="m165 99 13 4-4 40" stroke="#C4B5FD" strokeWidth="3" opacity="0.6" />
          {product === "multi-press" && <path d="m152 73-43 48 12 27m77-69 25 42-21 29m-79-3 15-4m62 8-14-7" stroke={metal} strokeWidth="7" />}
          {product === "lat-row" && <><path d="M192 54v49m-58 21 58-21 39 14M175 215l46-10 17-37" stroke={metal} strokeWidth="5" /><path d="m132 124-13 11m113-18 13 9" stroke="#C4B5FD" strokeWidth="6" /></>}
          {product === "leg" && <><path d="m158 189-33 31 34 15" stroke={metal} strokeWidth="7" /><path d="m134 221 35 12m-37-17 35 11" stroke="#52525B" strokeWidth="15" /></>}
          {product === "pec" && <><path d="m166 64-69 50 13 32m92-69 35 15 2 46" stroke={metal} strokeWidth="7" /><path d="m110 144 4 24m124-29v26" stroke="#C4B5FD" strokeWidth="6" /></>}
          {product === "hip" && <><path d="m152 190-27 37-19-1m72-39 30 31 25-9" stroke={metal} strokeWidth="7" /><path d="m127 213-13-18m93 11 9-19" stroke="#52525B" strokeWidth="15" /></>}
          <circle cx="287" cy="189" r="4" fill="#C4B5FD" />
        </g>
      )}
    </svg>
  );
}
