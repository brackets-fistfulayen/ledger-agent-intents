import "./ledger-skeleton";

import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

import type { LedgerSkeleton } from "./ledger-skeleton";

const meta: Meta<LedgerSkeleton> = {
  title: "Component/Atom/Skeleton",
  tags: ["autodocs"],
  render: () => html`<ledger-skeleton class="lb-h-16 lb-w-256"></ledger-skeleton>`,
  decorators: [
    (story) => html`
      <div class="lb-rounded-md lb-bg-canvas-sheet lb-p-16">${story()}</div>
    `,
  ],
};

export default meta;
type Story = StoryObj<LedgerSkeleton>;

export const Base: Story = {};

export const SizeShowcase: Story = {
  render: () => html`
    <div class="lb-flex lb-flex-col lb-gap-4">
      <ledger-skeleton class="lb-h-40 lb-w-56"></ledger-skeleton>
      <ledger-skeleton class="lb-h-12 lb-w-112"></ledger-skeleton>
      <ledger-skeleton class="lb-h-128 lb-w-256"></ledger-skeleton>
    </div>
  `,
};

export const ShapeShowcase: Story = {
  render: () => html`
    <div class="lb-flex lb-flex-col lb-gap-4">
      <ledger-skeleton class="lb-h-40 lb-w-256 lb-rounded-none"></ledger-skeleton>
      <ledger-skeleton class="lb-h-40 lb-w-256 lb-rounded-lg"></ledger-skeleton>
      <ledger-skeleton class="lb-h-48 lb-w-48 lb-rounded-full"></ledger-skeleton>
    </div>
  `,
};

export const TextLinesShowcase: Story = {
  render: () => html`
    <div class="lb-flex lb-flex-col lb-gap-8">
      <ledger-skeleton class="lb-h-16 lb-w-full"></ledger-skeleton>
      <ledger-skeleton class="lb-h-16 lb-w-3/4"></ledger-skeleton>
      <ledger-skeleton class="lb-h-16 lb-w-1/2"></ledger-skeleton>
    </div>
  `,
};

export const AccountItemExample: Story = {
  render: () => html`
    <div
      class="lb-flex lb-max-w-[400px] lb-items-center lb-gap-12 lb-rounded-lg lb-bg-muted lb-p-16"
    >
      <ledger-skeleton class="lb-h-40 lb-w-40 lb-rounded-full"></ledger-skeleton>
      <div class="lb-flex lb-flex-1 lb-flex-col lb-gap-8">
        <ledger-skeleton class="lb-h-16 lb-w-112"></ledger-skeleton>
        <ledger-skeleton class="lb-h-12 lb-w-80"></ledger-skeleton>
      </div>
      <ledger-skeleton class="lb-h-16 lb-w-56"></ledger-skeleton>
    </div>
  `,
};
