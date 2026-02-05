import "./ledger-status";

import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

const meta: Meta = {
  title: "Component/Organism/Status",
  component: "ledger-status",
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: { type: "select" },
      options: ["success", "error"],
      description: "The type of status to display",
      table: {
        type: { summary: "success | error" },
        defaultValue: { summary: "success" },
      },
    },
    title: {
      control: { type: "text" },
      description: "The main title of the status content",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "" },
      },
    },
    description: {
      control: { type: "text" },
      description: "The description text below the title",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "" },
      },
    },
    primaryButtonLabel: {
      control: { type: "text" },
      description: "Label for the primary action button",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "Close" },
      },
    },
    secondaryButtonLabel: {
      control: { type: "text" },
      description: "Label for the secondary action button",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "Secondary action" },
      },
    },
  },
  args: {
    type: "success",
    title: "Transaction signed",
    description: "You will receive the funds soon.",
    primaryButtonLabel: "Close",
    secondaryButtonLabel: "View transaction",
  },
};

export default meta;
type Story = StoryObj;

export const Success: Story = {
  args: {
    type: "success",
    title: "Transaction signed",
    description: "You will receive the funds soon.",
    primaryButtonLabel: "Close",
    secondaryButtonLabel: "View transaction",
  },
};

export const Error: Story = {
  args: {
    type: "error",
    title: "Error title",
    description: "Error description",
    primaryButtonLabel: "Main action",
    secondaryButtonLabel: "Secondary action",
  },
};

export const SuccessWithoutSecondaryButton: Story = {
  args: {
    type: "success",
    title: "Operation completed",
    description: "Your request has been processed successfully.",
    primaryButtonLabel: "Close",
  },
};

export const ErrorWithoutSecondaryButton: Story = {
  args: {
    type: "error",
    title: "Connection failed",
    description: "Please check your internet connection and try again.",
    primaryButtonLabel: "Retry",
  },
};

export const MinimalSuccess: Story = {
  args: {
    type: "success",
    title: "Success",
    primaryButtonLabel: "OK",
  },
};

export const MinimalError: Story = {
  args: {
    type: "error",
    title: "Error",
    primaryButtonLabel: "OK",
  },
};

export const InteractiveSuccess: Story = {
  args: {
    type: "success",
    title: "Transaction signed",
    description: "You will receive the funds soon.",
    primaryButtonLabel: "Close",
    secondaryButtonLabel: "View transaction",
  },
};

export const InteractiveError: Story = {
  args: {
    type: "error",
    title: "Transaction failed",
    description: "There was an error processing your transaction.",
    primaryButtonLabel: "Try again",
    secondaryButtonLabel: "Cancel",
  },
};

export const AllVariants: Story = {
  render: () => html`
    <div
      style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; padding: 20px;"
    >
      <div>
        <h3 style="color: white; margin-bottom: 10px;">Success Status</h3>
        <ledger-status
          type="success"
          title="Success!"
          description="Operation completed successfully"
          primary-button-label="Continue"
          secondary-button-label="Details"
        ></ledger-status>
      </div>
      <div>
        <h3 style="color: white; margin-bottom: 10px;">Error Status</h3>
        <ledger-status
          type="error"
          title="Error occurred"
          description="Something went wrong"
          primary-button-label="Retry"
          secondary-button-label="Cancel"
        ></ledger-status>
      </div>
    </div>
  `,
};
