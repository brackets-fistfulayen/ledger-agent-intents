import { createContext, provide } from "@lit/context";
import { html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";

import en from "../i18n/en.json" with { type: "json" };

export const languages = {
  en,
} as const;

export type Languages = typeof languages;
export type LangKey = keyof Languages;
export type Translation = Languages[keyof Languages];

export class LanguageContext {
  private _currentLanguage: keyof Languages = "en";

  constructor(private readonly _languages: Languages = languages) {}

  setCurrentLanguage(lang: keyof Languages) {
    this._currentLanguage = lang;
  }

  get currentLanguage(): LangKey {
    return this._currentLanguage;
  }

  get currentTranslation(): Translation {
    return this._languages[this._currentLanguage];
  }
}

export const langContext = createContext<LanguageContext>(
  Symbol.for("language"),
);

@customElement("language-provider")
export class LanguageProvider extends LitElement {
  @provide({ context: langContext })
  public languages: LanguageContext = new LanguageContext();

  override render() {
    return html`<slot></slot>`;
  }
}
