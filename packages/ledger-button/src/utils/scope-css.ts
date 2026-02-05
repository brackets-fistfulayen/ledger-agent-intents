/**
 * Scopes CSS selectors to .ledger-wallet-provider
 * This prevents CSS variables and global styles from leaking into host applications
 */
export function scopeCssSelectors(css: string): string {
  // First, replace :root with .ledger-wallet-provider
  css = css.replace(/:root/g, ".ledger-wallet-provider");

  // Scope ::backdrop pseudo-element (before other replacements to avoid double scoping)
  css = css.replace(
    /^(\s*)::backdrop\s*{/gm,
    "$1.ledger-wallet-provider::backdrop {",
  );

  // Scope universal selector * and pseudo-elements when they appear at the start
  // Match: *, ::before, ::after { or *,::before,::after {
  css = css.replace(
    /^(\s*)\*\s*,\s*::before\s*,\s*::after\s*{/gm,
    "$1.ledger-wallet-provider *, .ledger-wallet-provider ::before, .ledger-wallet-provider ::after {",
  );
  css = css.replace(/^(\s*)\*\s*{/gm, "$1.ledger-wallet-provider * {");

  // Fix any remaining unscoped ::before or ::after in comma-separated lists
  css = css.replace(
    /\.ledger-wallet-provider\s*\*,\s*::before\s*,\s*::after/g,
    ".ledger-wallet-provider *, .ledger-wallet-provider ::before, .ledger-wallet-provider ::after",
  );

  // Scope standalone ::before and ::after
  css = css.replace(
    /^(\s*)::before\s*,\s*::after\s*{/gm,
    "$1.ledger-wallet-provider ::before, .ledger-wallet-provider ::after {",
  );
  css = css.replace(
    /^(\s*)::before\s*{/gm,
    "$1.ledger-wallet-provider ::before {",
  );
  css = css.replace(
    /^(\s*)::after\s*{/gm,
    "$1.ledger-wallet-provider ::after {",
  );

  // Scope html selector (but preserve :host when it appears with html)
  // Match html at start of selector, but not when already scoped or with :host
  css = css.replace(
    /^(\s*)(?<!\.ledger-wallet-provider\s*)html\s*(?![,\s]*:host)/gm,
    "$1.ledger-wallet-provider",
  );
  // Handle :host,html case - scope html but keep :host
  css = css.replace(/:host\s*,\s*html/g, ":host, .ledger-wallet-provider");

  // Clean up any double scoping that might have occurred
  css = css.replace(
    /\.ledger-wallet-provider\.ledger-wallet-provider/g,
    ".ledger-wallet-provider",
  );

  // Scope body selector
  css = css.replace(/^(\s*)body\s*{/gm, "$1.ledger-wallet-provider body {");

  // Scope all other global element selectors at the start of rules
  const globalElements = [
    "hr",
    "abbr",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "a",
    "b",
    "strong",
    "code",
    "kbd",
    "samp",
    "pre",
    "small",
    "sub",
    "sup",
    "table",
    "button",
    "input",
    "optgroup",
    "select",
    "textarea",
    "progress",
    "summary",
    "blockquote",
    "dl",
    "dd",
    "figure",
    "p",
    "fieldset",
    "legend",
    "ol",
    "ul",
    "menu",
    "dialog",
    "img",
    "svg",
    "video",
    "canvas",
    "audio",
    "iframe",
    "embed",
    "object",
  ];

  // Scope element selectors that appear at the start of CSS rules
  globalElements.forEach((element) => {
    // Match element at start of line or after comma, followed by pseudo-class or {
    const regex = new RegExp(
      `(^|\\n)(\\s*)${element}(?=\\s*[:{\\[]|\\s*,\\s*[a-z-]|\\s*{)`,
      "gm",
    );
    css = css.replace(regex, `$1$2.ledger-wallet-provider ${element}`);
  });

  // Scope pseudo-class selectors
  css = css.replace(
    /^(\s*):disabled\s*{/gm,
    "$1.ledger-wallet-provider :disabled {",
  );

  // Scope attribute selectors
  css = css.replace(
    /^(\s*)\[hidden\](?::where\([^)]+\))?\s*{/gm,
    "$1.ledger-wallet-provider [hidden]$2 {",
  );
  css = css.replace(
    /^(\s*)\[type=search\]\s*{/gm,
    "$1.ledger-wallet-provider [type=search] {",
  );

  // Scope vendor-prefixed selectors
  css = css.replace(
    /^(\s*):-moz-focusring\s*{/gm,
    "$1.ledger-wallet-provider :-moz-focusring {",
  );
  css = css.replace(
    /^(\s*):-moz-ui-invalid\s*{/gm,
    "$1.ledger-wallet-provider :-moz-ui-invalid {",
  );
  css = css.replace(
    /^(\s*)::-webkit-inner-spin-button\s*,(\s*)::-webkit-outer-spin-button\s*{/gm,
    "$1.ledger-wallet-provider ::-webkit-inner-spin-button,$2.ledger-wallet-provider ::-webkit-outer-spin-button {",
  );
  css = css.replace(
    /^(\s*)::-webkit-search-decoration\s*{/gm,
    "$1.ledger-wallet-provider ::-webkit-search-decoration {",
  );
  css = css.replace(
    /^(\s*)::-webkit-file-upload-button\s*{/gm,
    "$1.ledger-wallet-provider ::-webkit-file-upload-button {",
  );

  // Scope placeholder selectors
  css = css.replace(
    /^(\s*)input::-moz-placeholder\s*,(\s*)textarea::-moz-placeholder\s*{/gm,
    "$1.ledger-wallet-provider input::-moz-placeholder,$2.ledger-wallet-provider textarea::-moz-placeholder {",
  );
  css = css.replace(
    /^(\s*)input::placeholder\s*,(\s*)textarea::placeholder\s*{/gm,
    "$1.ledger-wallet-provider input::placeholder,$2.ledger-wallet-provider textarea::placeholder {",
  );

  // Scope role selector
  css = css.replace(
    /^(\s*)\[role=button\]\s*{/gm,
    "$1.ledger-wallet-provider [role=button] {",
  );

  return css;
}
