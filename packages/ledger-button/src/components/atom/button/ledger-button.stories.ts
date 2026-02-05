import "./ledger-button";

import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

import type { LedgerButtonAttributes } from "./ledger-button";

const meta: Meta<LedgerButtonAttributes> = {
  title: "Component/Atom/Button",
  tags: ["autodocs"],
  render: (args) => html`
    <ledger-button
      .label=${args.label || ""}
      .variant=${args.variant || "primary"}
      .size=${args.size || "medium"}
      .iconPosition=${args.iconPosition || "left"}
      .type=${args.type || "button"}
      ?disabled=${args.disabled}
      ?icon=${args.icon}
      @ledger-button-click=${(e: CustomEvent) => {
        console.log("Button clicked:", e.detail);
      }}
    ></ledger-button>
  `,
  argTypes: {
    label: {
      control: "text",
      description: "The text displayed on the button",
    },
    variant: {
      control: "select",
      options: ["primary", "secondary", "accent", "tertiary"],
      description: "The variant of the button",
    },
    size: {
      control: "select",
      options: ["small", "medium", "large", "icon"],
      description: "The size of the button",
    },
    disabled: {
      control: "boolean",
      description: "Whether the button is disabled",
    },
    icon: {
      control: "boolean",
      description: "Whether to show the Ledger icon",
    },
    iconPosition: {
      control: "select",
      options: ["left", "right"],
      description: "Position of the icon relative to text",
    },
    type: {
      control: "select",
      options: ["button", "submit", "reset"],
      description: "HTML button type",
    },
  },
};

export default meta;
type Story = StoryObj<LedgerButtonAttributes>;

export const PrimaryWithIcon: Story = {
  args: {
    label: "Connect Ledger",
    variant: "primary",
    size: "medium",
    icon: true,
    disabled: false,
  },
};

export const PrimaryWithNoIcon: Story = {
  args: {
    label: "Connect Ledger",
    variant: "primary",
    size: "medium",
    disabled: false,
  },
};

export const Secondary: Story = {
  args: {
    label: "Secondary Action",
    variant: "secondary",
    size: "medium",
    icon: true,
    disabled: false,
  },
};

export const SecondaryWithNoIcon: Story = {
  args: {
    label: "Secondary Action",
    variant: "secondary",
    size: "medium",
    disabled: false,
  },
};

export const SmallButtons: Story = {
  render: () => html`
    <div
      style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;"
    >
      <ledger-button
        label="Small Primary"
        variant="primary"
        size="small"
      ></ledger-button>
      <ledger-button
        label="Small Secondary"
        variant="secondary"
        size="small"
      ></ledger-button>
      <ledger-button variant="primary" size="small" icon></ledger-button>
    </div>
  `,
};

export const MediumButtons: Story = {
  render: () => html`
    <div
      style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;"
    >
      <ledger-button
        label="Medium Primary"
        variant="primary"
        size="medium"
      ></ledger-button>
      <ledger-button
        label="Medium Secondary"
        variant="secondary"
        size="medium"
      ></ledger-button>
      <ledger-button variant="primary" size="medium" icon></ledger-button>
    </div>
  `,
};

export const LargeButtons: Story = {
  render: () => html`
    <div
      style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;"
    >
      <ledger-button
        label="Large Primary"
        variant="primary"
        size="large"
      ></ledger-button>
      <ledger-button
        label="Large Secondary"
        variant="secondary"
        size="large"
      ></ledger-button>
      <ledger-button variant="primary" size="large" icon></ledger-button>
    </div>
  `,
};

export const DisabledStates: Story = {
  render: () => html`
    <div
      style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;"
    >
      <ledger-button
        label="Disabled Primary"
        variant="primary"
        size="medium"
        ?disabled=${true}
      ></ledger-button>
      <ledger-button
        label="Disabled Secondary"
        variant="secondary"
        size="medium"
        ?disabled=${true}
      ></ledger-button>
      <ledger-button
        variant="primary"
        size="medium"
        icon
        ?disabled=${true}
      ></ledger-button>
    </div>
  `,
};

export const AllVariants: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 20px;">
      <div>
        <h3
          style="margin-bottom: 12px; font-size: 14px; font-weight: 600; color: #374151;"
        >
          Button Variants
        </h3>
        <div
          style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;"
        >
          <ledger-button
            label="Primary"
            variant="primary"
            size="medium"
          ></ledger-button>
          <ledger-button
            label="Secondary"
            variant="secondary"
            size="medium"
          ></ledger-button>
        </div>
      </div>

      <div>
        <h3
          style="margin-bottom: 12px; font-size: 14px; font-weight: 600; color: #374151;"
        >
          Button Sizes
        </h3>
        <div
          style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;"
        >
          <ledger-button
            label="Small"
            variant="primary"
            size="small"
          ></ledger-button>
          <ledger-button
            label="Medium"
            variant="primary"
            size="medium"
          ></ledger-button>
          <ledger-button
            label="Large"
            variant="primary"
            size="large"
          ></ledger-button>
        </div>
      </div>

      <div>
        <h3
          style="margin-bottom: 12px; font-size: 14px; font-weight: 600; color: #374151;"
        >
          Button States
        </h3>
        <div
          style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;"
        >
          <ledger-button
            label="Normal"
            variant="primary"
            size="medium"
          ></ledger-button>
          <ledger-button
            label="Disabled"
            variant="primary"
            size="medium"
            ?disabled=${true}
          ></ledger-button>
        </div>
      </div>
    </div>
  `,
};
