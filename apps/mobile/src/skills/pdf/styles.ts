export const material3Stylesheet = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;700&family=Roboto+Mono:wght@400;500&display=swap');

:root {
  --md-sys-color-primary: #6750A4;
  --md-sys-color-on-primary: #FFFFFF;
  --md-sys-color-primary-container: #EADDFF;
  --md-sys-color-on-primary-container: #21005D;
  --md-sys-color-surface: #FEF7FF;
  --md-sys-color-on-surface: #1D1B20;
  --md-sys-color-surface-variant: #E7E0EC;
  --md-sys-color-on-surface-variant: #49454F;
  --md-sys-color-outline: #79747E;
}

body {
  font-family: 'Outfit', sans-serif;
  background-color: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  line-height: 1.6;
  margin: 40px;
  padding: 0;
}

h1, h2, h3, h4 {
  color: var(--md-sys-color-on-primary-container);
  font-weight: 700;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}

h1 {
  font-size: 2.5rem;
  border-bottom: 2px solid var(--md-sys-color-primary);
  padding-bottom: 10px;
  margin-top: 0;
}

h2 {
  font-size: 1.8rem;
  color: var(--md-sys-color-primary);
}

h3 {
  font-size: 1.4rem;
}

p, li {
  font-size: 1.1rem;
  color: var(--md-sys-color-on-surface);
}

ul, ol {
  padding-left: 20px;
  margin-bottom: 1.5em;
}

li {
  margin-bottom: 0.5em;
}

code {
  font-family: 'Roboto Mono', monospace;
  background-color: var(--md-sys-color-surface-variant);
  color: var(--md-sys-color-on-surface-variant);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.95rem;
}

pre {
  background-color: var(--md-sys-color-surface-variant);
  border-left: 4px solid var(--md-sys-color-primary);
  padding: 15px;
  border-radius: 8px;
  overflow-x: auto;
  margin-bottom: 1.5em;
}

pre code {
  padding: 0;
  background-color: transparent;
  border-radius: 0;
}

blockquote {
  background-color: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
  margin: 1.5em 0;
  padding: 15px 20px;
  border-left: 6px solid var(--md-sys-color-primary);
  border-radius: 0 8px 8px 0;
}

blockquote p {
  margin: 0;
  font-style: italic;
}

.footer {
  margin-top: 50px;
  border-top: 1px solid var(--md-sys-color-outline);
  padding-top: 15px;
  font-size: 0.85rem;
  color: var(--md-sys-color-on-surface-variant);
  text-align: center;
}
`;
