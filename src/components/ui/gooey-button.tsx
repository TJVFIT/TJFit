import React from 'react';

const GooeyButton = () => {
    return (
        <button className="gooey-button">
            SUBMIT
            <div className="bubbles">
                {/* Creates 5 span elements for the bubbles */}
                {[...Array(5)].map((_, i) => <span key={i}></span>)}
            </div>
        </button>
    );
};

export default GooeyButton;

/**
 * The SVG filter the gooey effect depends on. Mounted once in the root
 * layout so every `.gooey-cta` / `.gooey-button` on the site can reference
 * `filter: url(#gooey)` without carrying its own copy. Zero-size instead
 * of display:none — WebKit ignores filters defined inside display:none SVG.
 */
export function GooeyFilter() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="0" height="0" style={{ position: 'absolute' }} aria-hidden>
            <defs>
                <filter id="gooey">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
                    <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
                    <feBlend in="SourceGraphic" in2="goo" />
                </filter>
            </defs>
        </svg>
    );
}
