import GooeyButton from "@/components/ui/gooey-button";

export default function DemoOne() {
  return (
    <div className="App">
      {/* This SVG filter is essential for the effect.
        It's hidden but referenced by the CSS `filter` property.
      */}
      <svg xmlns="http://www.w3.org/2000/svg" version="1.1" style={{ display: 'none' }}>
          <defs>
              <filter id="gooey">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
                  <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
                  <feBlend in="SourceGraphic" in2="goo" />
              </filter>
          </defs>
      </svg>

      <GooeyButton />
    </div>
  );
}
