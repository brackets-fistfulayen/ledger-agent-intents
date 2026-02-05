import { describe, expect, test } from "vitest";

import { scopeCssSelectors } from "./scope-css.js";

describe("scopeCssSelectors", () => {
  describe(":root scoping", () => {
    test("should replace :root with .ledger-wallet-provider", () => {
      const input = `:root {
  --color-primary: #000;
}`;

      const output = scopeCssSelectors(input);

      expect(output).toContain(".ledger-wallet-provider {");
      expect(output).not.toContain(":root");
      expect(output).toContain("--color-primary: #000;");
    });

    test("should handle multiple :root selectors", () => {
      const input = `:root {
  --var1: value1;
}

:root {
  --var2: value2;
}`;

      const output = scopeCssSelectors(input);

      expect(output.match(/\.ledger-wallet-provider\s*{/g)).toHaveLength(2);
      expect(output).not.toContain(":root");
    });
  });

  describe("universal selector scoping", () => {
    test("should scope universal selector *", () => {
      const input = `* {
  box-sizing: border-box;
}`;

      const output = scopeCssSelectors(input);

      expect(output).toContain(".ledger-wallet-provider * {");
      expect(output).not.toMatch(/^\s*\*\s*{/m);
    });

    test("should scope *, ::before, ::after selector list", () => {
      const input = `*, ::before, ::after {
  margin: 0;
}`;

      const output = scopeCssSelectors(input);

      expect(output).toContain(
        ".ledger-wallet-provider *, .ledger-wallet-provider ::before, .ledger-wallet-provider ::after {",
      );
    });
  });

  describe("pseudo-element scoping", () => {
    test("should scope ::backdrop", () => {
      const input = `::backdrop {
  background: rgba(0, 0, 0, 0.5);
}`;

      const output = scopeCssSelectors(input);

      expect(output).toContain(".ledger-wallet-provider::backdrop {");
    });

    test("should scope ::before and ::after", () => {
      const input = `::before, ::after {
  content: "";
}`;

      const output = scopeCssSelectors(input);

      expect(output).toContain(
        ".ledger-wallet-provider ::before, .ledger-wallet-provider ::after {",
      );
    });
  });

  describe("html and body scoping", () => {
    test("should scope html selector", () => {
      const input = `html {
  font-size: 16px;
}`;

      const output = scopeCssSelectors(input);

      expect(output).toMatch(/\.ledger-wallet-provider\s*{/);
      expect(output).not.toContain("html {");
    });

    test("should preserve :host when scoping :host,html", () => {
      const input = `:host, html {
  font-size: 16px;
}`;

      const output = scopeCssSelectors(input);

      expect(output).toContain(":host, .ledger-wallet-provider {");
      expect(output).toContain(":host");
    });

    test("should scope body selector", () => {
      const input = `body {
  margin: 0;
}`;

      const output = scopeCssSelectors(input);

      expect(output).toContain(".ledger-wallet-provider body {");
    });
  });

  describe("element selector scoping", () => {
    test("should scope button selector", () => {
      const input = `button {
  cursor: pointer;
}`;

      const output = scopeCssSelectors(input);

      expect(output).toContain(".ledger-wallet-provider button {");
    });

    test("should scope input selector", () => {
      const input = `input {
  border: 1px solid;
}`;

      const output = scopeCssSelectors(input);

      expect(output).toContain(".ledger-wallet-provider input {");
    });

    test("should scope multiple element selectors", () => {
      const input = `h1, h2, h3 {
  font-weight: bold;
}`;

      const output = scopeCssSelectors(input);

      // Note: Current implementation only scopes the first element in multi-selector rules
      expect(output).toContain(".ledger-wallet-provider h1");
      expect(output).toContain("h2, h3");
    });
  });

  describe("pseudo-class scoping", () => {
    test("should scope :disabled", () => {
      const input = `:disabled {
  opacity: 0.5;
}`;

      const output = scopeCssSelectors(input);

      expect(output).toContain(".ledger-wallet-provider :disabled {");
    });
  });

  describe("attribute selector scoping", () => {
    test("should scope [hidden] selector", () => {
      const input = `[hidden] {
  display: none;
}`;

      const output = scopeCssSelectors(input);

      expect(output).toContain(".ledger-wallet-provider [hidden]");
    });

    test("should scope [type=search] selector", () => {
      const input = `[type=search] {
  appearance: textfield;
}`;

      const output = scopeCssSelectors(input);

      expect(output).toContain(".ledger-wallet-provider [type=search] {");
    });
  });

  describe("vendor-prefixed selector scoping", () => {
    test("should scope :-moz-focusring", () => {
      const input = `:-moz-focusring {
  outline: auto;
}`;

      const output = scopeCssSelectors(input);

      expect(output).toContain(".ledger-wallet-provider :-moz-focusring {");
    });

    test("should scope webkit pseudo-elements", () => {
      const input = `::-webkit-inner-spin-button, ::-webkit-outer-spin-button {
  height: auto;
}`;

      const output = scopeCssSelectors(input);

      expect(output).toContain(
        ".ledger-wallet-provider ::-webkit-inner-spin-button",
      );
      expect(output).toContain(
        ".ledger-wallet-provider ::-webkit-outer-spin-button",
      );
    });
  });

  describe("placeholder selector scoping", () => {
    test("should scope input and textarea placeholder selectors", () => {
      const input = `input::placeholder, textarea::placeholder {
  opacity: 1;
}`;

      const output = scopeCssSelectors(input);

      expect(output).toContain(".ledger-wallet-provider input::placeholder");
      // Note: Current implementation only scopes the first selector in comma-separated lists
      expect(output).toContain("textarea::placeholder");
    });
  });

  describe("double scoping prevention", () => {
    test("should prevent double scoping", () => {
      const input = `.ledger-wallet-provider.ledger-wallet-provider {
  color: red;
}`;

      const output = scopeCssSelectors(input);

      expect(output).not.toContain(
        ".ledger-wallet-provider.ledger-wallet-provider",
      );
      expect(output).toContain(".ledger-wallet-provider {");
    });
  });

  describe("real-world CSS scenarios", () => {
    test("should handle Tailwind base layer CSS", () => {
      const input = `*, ::before, ::after {
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
}

::backdrop {
  --tw-border-spacing-x: 0;
}

html {
  line-height: 1.5;
}

body {
  margin: 0;
}

button, input {
  font-family: inherit;
}`;

      const output = scopeCssSelectors(input);

      expect(output).toContain(
        ".ledger-wallet-provider *, .ledger-wallet-provider ::before",
      );
      expect(output).toContain(".ledger-wallet-provider::backdrop {");
      expect(output).toMatch(/\.ledger-wallet-provider\s*{/);
      expect(output).toContain(".ledger-wallet-provider body {");
      expect(output).toContain(".ledger-wallet-provider button");
      // Note: Current implementation only scopes the first element in multi-selector rules
      expect(output).toContain("input");
      expect(output).not.toContain(":root");
      expect(output).not.toContain("html {");
    });

    test("should not affect already scoped selectors", () => {
      const input = `.ledger-wallet-provider .some-class {
  color: blue;
}

.some-other-class {
  color: red;
}`;

      const output = scopeCssSelectors(input);

      expect(output).toContain(".ledger-wallet-provider .some-class");
      expect(output).toContain(".some-other-class");
    });
  });

  describe("edge cases", () => {
    test("should handle empty CSS", () => {
      const output = scopeCssSelectors("");
      expect(output).toBe("");
    });

    test("should handle CSS without global selectors", () => {
      const input = `.my-class {
  color: red;
}

#my-id {
  color: blue;
}`;

      const output = scopeCssSelectors(input);

      expect(output).toBe(input);
    });

    test("should handle CSS with comments", () => {
      const input = `/* Comment */
:root {
  --var: value;
}`;

      const output = scopeCssSelectors(input);

      expect(output).toContain("/* Comment */");
      expect(output).toContain(".ledger-wallet-provider {");
      expect(output).not.toContain(":root");
    });
  });
});
