import { cva } from "class-variance-authority";
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

import { tailwindElement } from "../../../../tailwind-element.js";
import apexp from "./apexp.js";
import flex from "./flex.js";
import nano from "./nano.js";
import stax from "./stax.js";

export type DeviceModelId =
  | "stax"
  | "flex"
  | "nanoS"
  | "nanoSP"
  | "nanoX"
  | "apexp";

const iconContainerVariants = cva([
  "lb-flex lb-h-24 lb-w-24 lb-items-center lb-justify-center lb-rounded-full",
  "bg-muted-transparent",
]);

@customElement("device-icon")
@tailwindElement()
export class DeviceIcon extends LitElement {
  @property({ type: String })
  modelId: DeviceModelId = "flex";

  private get iconContainerClass() {
    return {
      [iconContainerVariants()]: true,
    };
  }

  private getIcon() {
    switch (this.modelId) {
      case "stax":
        return stax;
      case "flex":
        return flex;
      case "nanoS":
      case "nanoSP":
      case "nanoX":
        return nano;
      case "apexp":
        return apexp;
      default:
        return flex;
    }
  }

  override render() {
    return html`
      <div class=${classMap(this.iconContainerClass)}>${this.getIcon()}</div>
    `;
  }
}
