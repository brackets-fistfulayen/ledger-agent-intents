import "../button/ledger-button";
import "./ledger-modal";
import "../../molecule/toolbar/ledger-toolbar";
import "../../molecule/info-state/ledger-info-state";

import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { within as shadowWithin } from "shadow-dom-testing-library";
import { expect, userEvent, waitFor } from "storybook/test";

import type { LedgerModal } from "./ledger-modal";

const meta: Meta<LedgerModal> = {
  title: "Component/Atom/Modal",
  component: "ledger-modal",
  tags: ["autodocs"],
  render: () => html`
    <ledger-button
      @click=${() => {
        const modal = document.querySelector("ledger-modal") as LedgerModal | null;
        if (modal) {
          modal.openModal();
        }
      }}
      label="Open Modal"
      variant="secondary"
    >
    </ledger-button>
    <ledger-modal>
      <div slot="toolbar">
        <ledger-toolbar
          title="Ledger Modal Example"
          .canClose=${true}
          @ledger-toolbar-close=${() => {
            const modal = document.querySelector("ledger-modal") as LedgerModal | null;
            if (modal) {
              modal.closeModal();
            }
          }}
        ></ledger-toolbar>
      </div>
      <ledger-info-state
        title="Ledger Modal Example"
        subtitle="Follow the instructions on your device to continue"
        device="flex"
      ></ledger-info-state>
    </ledger-modal>
  `,
};

export default meta;
type Story = StoryObj<LedgerModal>;

export const Default: Story = {
  args: {},
};

export const TestModalInteractions: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = shadowWithin(canvasElement);
    const button = canvas.getByShadowRole("button", {
      name: "Open Modal",
    });
    await step("Initial State - modal should not be visible", async () => {
      const backdrop = canvas.queryByRole("dialog");
      expect(backdrop).not.toBeInTheDocument();
    });

    await step("Click the button - wait for the modal to open", async () => {
      await userEvent.click(button);
      const backdrop = canvas.queryByShadowRole("dialog");
      expect(backdrop).toBeInTheDocument();
    });

    await step(
      "Click the close button - wait for the modal to close",
      async () => {
        const closeButtons = canvas.getAllByShadowTestId("close-button");
        const [closeButton] = closeButtons; // Skipping the first close button as it's the default toolbar (they both get rendered)
        await userEvent.click(closeButton);
        await waitFor(async () => {
          const backdrop = canvas.queryByShadowRole("dialog");
          expect(backdrop).not.toBeInTheDocument();
        });
      },
    );
  },
};
