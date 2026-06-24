/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "on-primary-fixed-variant": "#474649",
        "on-primary": "#ffffff",
        "on-tertiary-fixed": "#002113",
        "background": "#f9f9fa",
        "primary": "#000000",
        "on-secondary": "#ffffff",
        "on-primary-fixed": "#1c1b1d",
        "surface-container-lowest": "#ffffff",
        "secondary": "#5d5e66",
        "on-surface-variant": "#47464a",
        "surface-dim": "#dadadb",
        "surface-variant": "#e2e2e3",
        "primary-fixed-dim": "#c8c6c8",
        "error": "#ba1a1a",
        "inverse-on-surface": "#f0f1f2",
        "surface-tint": "#5f5e60",
        "secondary-fixed": "#e2e1eb",
        "on-tertiary-container": "#009668",
        "on-error-container": "#93000a",
        "inverse-surface": "#2f3132",
        "secondary-fixed-dim": "#c6c6cf",
        "surface-bright": "#f9f9fa",
        "surface-container": "#eeeeef",
        "outline": "#78767b",
        "surface-container-low": "#f3f3f4",
        "primary-container": "#1c1b1d",
        "primary-fixed": "#e5e1e4",
        "on-secondary-container": "#63646c",
        "surface-container-highest": "#e2e2e3",
        "tertiary-container": "#002113",
        "tertiary-fixed-dim": "#4edea3",
        "inverse-primary": "#c8c6c8",
        "on-background": "#1a1c1d",
        "on-primary-container": "#858386",
        "tertiary": "#000000",
        "error-container": "#ffdad6",
        "on-tertiary-fixed-variant": "#005236",
        "outline-variant": "#c8c5ca",
        "secondary-container": "#e2e1eb",
        "surface-container-high": "#e8e8e9",
        "on-secondary-fixed": "#1a1b22",
        "tertiary-fixed": "#6ffbbe",
        "surface": "#f9f9fa",
        "on-secondary-fixed-variant": "#45464e",
        "on-surface": "#1a1c1d",
        "on-tertiary": "#ffffff",
        "on-error": "#ffffff"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      spacing: {
        "panel-padding": "16px",
        "edge-margin": "24px",
        "unit": "4px",
        "gutter": "1px",
        "density-tight": "8px"
      },
      fontFamily: {
        "headline-md": ["Inter", "sans-serif"],
        "display-lg": ["Inter", "sans-serif"],
        "label-caps": ["Inter", "sans-serif"],
        "data-sm": ["JetBrains Mono", "monospace"],
        "data-lg": ["JetBrains Mono", "monospace"],
        "body-main": ["Inter", "sans-serif"]
      },
      fontSize: {
        "headline-md": ["24px", { "lineHeight": "1.2", "letterSpacing": "-0.02em", "fontWeight": "700" }],
        "display-lg": ["48px", { "lineHeight": "1", "letterSpacing": "-0.04em", "fontWeight": "800" }],
        "label-caps": ["11px", { "lineHeight": "1", "letterSpacing": "0.1em", "fontWeight": "700" }],
        "data-sm": ["12px", { "lineHeight": "1.4", "letterSpacing": "0em", "fontWeight": "400" }],
        "data-lg": ["16px", { "lineHeight": "1.4", "letterSpacing": "-0.01em", "fontWeight": "500" }],
        "body-main": ["14px", { "lineHeight": "1.5", "letterSpacing": "0em", "fontWeight": "400" }]
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
}

