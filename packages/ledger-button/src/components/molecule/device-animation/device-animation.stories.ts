import "./device-animation";

import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

import type { AnimationKey, LedgerDeviceAnimation } from "./device-animation";

const meta: Meta<LedgerDeviceAnimation> = {
  title: "Component/Molecule/DeviceAnimation",
  component: "ledger-device-animation",
  argTypes: {
    modelId: {
      control: { type: "select" },
      options: ["nanos", "nanosp", "nanox", "stax", "flex", "apexp"],
    },
    animation: {
      control: { type: "select" },
      options: [
        "pin",
        "pairing",
        "pairingSuccess",
        "frontView",
        "continueOnLedger",
        "signTransaction",
      ],
    },
    autoplay: { control: "boolean" },
    loop: { control: "boolean" },
  },
  args: {
    modelId: "stax",
    animation: "continueOnLedger",
    autoplay: true,
    loop: true,
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<LedgerDeviceAnimation>;

export const Default: Story = {
  render: (args) => html`
    <ledger-device-animation
      .modelId=${args.modelId}
      .animation=${args.animation}
      .autoplay=${args.autoplay}
      .loop=${args.loop}
    ></ledger-device-animation>
  `,
};

export const AllNanoSAndSPAnimations: Story = {
  render: (args) => html`
    <div
      style="display: flex; flex-wrap: wrap; gap: 2rem; background-color: black; padding: 2rem;"
    >
      ${["pin", "continueOnLedger", "signTransaction"].map((animation) => {
        return html`
          <div
            style="flex: 0 0 220px; display: flex; flex-direction: column; align-items: center;"
          >
            <div
              style="margin-bottom: 0.5rem; font-weight: bold; color: white;"
            >
              ${animation}
            </div>
            <ledger-device-animation
              .modelId=${"nanoS"}
              .animation=${animation as AnimationKey}
              .autoplay=${args.autoplay}
              .loop=${args.loop}
            ></ledger-device-animation>
          </div>
        `;
      })}
    </div>
  `,
};

export const AllNanoXAnimations: Story = {
  render: (args) => html`
    <div
      style="display: flex; flex-wrap: wrap; gap: 2rem; background-color: black; padding: 2rem;"
    >
      ${["pin", "continueOnLedger", "pairing", "signTransaction"].map(
        (animation) => {
          return html`
            <div
              style="flex: 0 0 220px; display: flex; flex-direction: column; align-items: center;"
            >
              <div
                style="margin-bottom: 0.5rem; font-weight: bold; color: white;"
              >
                ${animation}
              </div>
              <ledger-device-animation
                .modelId=${"nanoX"}
                .animation=${animation as AnimationKey}
                .autoplay=${args.autoplay}
                .loop=${args.loop}
              ></ledger-device-animation>
            </div>
          `;
        },
      )}
    </div>
  `,
};

export const AllStaxAnimations: Story = {
  render: (args) => html`
    <div
      style="display: flex; flex-wrap: wrap; gap: 2rem; background-color: black; padding: 2rem;"
    >
      ${[
        "pin",
        "continueOnLedger",
        "pairing",
        "pairingSuccess",
        "frontView",
        "signTransaction",
      ].map((animation) => {
        return html`
          <div
            style="flex: 0 0 220px; display: flex; flex-direction: column; align-items: center;"
          >
            <div
              style="margin-bottom: 0.5rem; font-weight: bold; color: white;"
            >
              ${animation}
            </div>
            <ledger-device-animation
              .modelId=${"stax"}
              .animation=${animation as AnimationKey}
              .autoplay=${args.autoplay}
              .loop=${args.loop}
            ></ledger-device-animation>
          </div>
        `;
      })}
    </div>
  `,
};

export const AllFlexAnimations: Story = {
  render: (args) => html`
    <div
      style="display: flex; flex-wrap: wrap; gap: 2rem; background-color: black; padding: 2rem;"
    >
      ${[
        "pin",
        "continueOnLedger",
        "pairing",
        "pairingSuccess",
        "frontView",
        "signTransaction",
      ].map((animation) => {
        return html`
          <div
            style="flex: 0 0 220px; display: flex; flex-direction: column; align-items: center;"
          >
            <div
              style="margin-bottom: 0.5rem; font-weight: bold; color: white;"
            >
              ${animation}
            </div>
            <ledger-device-animation
              .modelId=${"flex"}
              .animation=${animation as AnimationKey}
              .autoplay=${args.autoplay}
              .loop=${args.loop}
            ></ledger-device-animation>
          </div>
        `;
      })}
    </div>
  `,
};

export const AllApexAnimations: Story = {
  render: (args) => html`
    <div
      style="display: flex; flex-wrap: wrap; gap: 2rem; background-color: black; padding: 2rem;"
    >
      ${["pin", "continueOnLedger", "signTransaction"].map((animation) => {
        return html`
          <div
            style="flex: 0 0 220px; display: flex; flex-direction: column; align-items: center;"
          >
            <div
              style="margin-bottom: 0.5rem; font-weight: bold; color: white;"
            >
              ${animation}
            </div>
            <ledger-device-animation
              .modelId=${"apexp"}
              .animation=${animation as AnimationKey}
              .autoplay=${args.autoplay}
              .loop=${args.loop}
            ></ledger-device-animation>
          </div>
        `;
      })}
    </div>
  `,
};

export const AllDeviceAnimations: Story = {
  render: (args) => html`
    <div
      style="display: flex; flex-wrap: wrap; gap: 2rem; background-color: black;"
    >
      ${(["nanoS", "nanoSP", "nanoX", "stax", "flex", "apexp"] as const).map(
        (modelId) => html`
          <div
            style="flex: 0 0 220px; display: flex; flex-direction: column; align-items: center;"
          >
            <div style="margin-bottom: 0.5rem; font-weight: bold;">
              ${modelId}
            </div>
            <ledger-device-animation
              .modelId=${modelId}
              .animation=${args.animation}
              .autoplay=${args.autoplay}
              .loop=${args.loop}
            ></ledger-device-animation>
          </div>
        `,
      )}
    </div>
  `,
  args: {
    animation: "continueOnLedger",
    autoplay: true,
    loop: true,
  },
};
