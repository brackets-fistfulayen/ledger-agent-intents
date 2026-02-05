import "./ledger-lottie";

import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { within as shadowWithin } from "shadow-dom-testing-library";
import { expect } from "storybook/test";

import type { LedgerLottieAttributes } from "./ledger-lottie";

const meta: Meta<LedgerLottieAttributes> = {
  title: "Component/Atom/Lottie",
  tags: ["autodocs"],
  render: (args) =>
    html`<ledger-lottie
      animationName=${args.animationName}
      .size=${args.size || "large"}
      ?autoplay=${args.autoplay}
      ?loop=${args.loop}
      ?paused=${args.paused}
      .speed=${args.speed || 1}
    ></ledger-lottie>`,
  argTypes: {
    animationData: {
      control: "object",
      description: "The Lottie animation data",
      table: {
        type: { summary: "object" },
        defaultValue: { summary: "undefined" },
      },
    },
    animationName: {
      control: "select",
      options: ["loadingSpinner", "checkmark", "backgroundFlare"],
      description: "The Lottie animation name",
      table: {
        type: { summary: "object" },
        defaultValue: { summary: "undefined" },
      },
    },
    size: {
      control: "select",
      options: ["small", "medium", "large", "full"],
      description:
        "Predefined size: small (32px), medium (64px), large (128px), full (100%)",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "medium" },
      },
    },
    autoplay: {
      control: "boolean",
      description:
        "Whether to start playing the animation automatically when loaded",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    loop: {
      control: "boolean",
      description: "Whether to loop the animation continuously",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    paused: {
      control: "boolean",
      description: "Whether the animation is currently paused",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    speed: {
      control: "number",
      description:
        "Animation playback speed multiplier (0.1 = 10% speed, 2 = 200% speed)",
      min: 0.1,
      max: 5,
      step: 0.1,
      table: {
        type: { summary: "number" },
        defaultValue: { summary: "1" },
      },
    },
  },
};

export default meta;
type Story = StoryObj<LedgerLottieAttributes>;

export const LoadingSpinner: Story = {
  args: {
    animationName: "loadingSpinner",
    size: "medium",
    autoplay: true,
    loop: true,
    paused: false,
    speed: 1,
  },
  parameters: {
    docs: {
      description: {
        story: "Continuously looping loading spinner",
      },
    },
  },
};

export const Checkmark: Story = {
  args: {
    animationName: "checkmark",
    size: "medium",
    autoplay: true,
    loop: false,
    paused: false,
    speed: 1,
  },
  parameters: {
    docs: {
      description: {
        story: "Checkmark that plays once",
      },
    },
  },
};

export const BackgroundFlare: Story = {
  args: {
    animationName: "backgroundFlare",
    size: "full",
    autoplay: true,
    loop: true,
    paused: false,
    speed: 1,
  },
  parameters: {
    docs: {
      description: {
        story: "Background flare animation",
      },
    },
  },
  render: (args) => html`
    <div style="max-width: 400px;">
      <ledger-lottie
        animationName=${args.animationName}
        .size=${args.size || "large"}
        ?autoplay=${args.autoplay}
        ?loop=${args.loop}
        ?paused=${args.paused}
        .speed=${args.speed || 1}
      ></ledger-lottie>
    </div>
  `,
};

export const PausedAnimation: Story = {
  args: {
    animationName: "loadingSpinner",
    size: "medium",
    autoplay: false,
    loop: true,
    paused: true,
    speed: 1,
  },
};

export const SlowAnimation: Story = {
  args: {
    animationName: "checkmark",
    size: "large",
    autoplay: true,
    loop: true,
    paused: false,
    speed: 0.5,
  },
};

export const FastAnimation: Story = {
  args: {
    animationName: "loadingSpinner",
    size: "large",
    autoplay: true,
    loop: true,
    paused: false,
    speed: 2,
  },
};

export const DifferentSizes: Story = {
  render: () => html`
    <div
      style="display: flex; gap: 24px; align-items: center; flex-wrap: wrap;"
    >
      <div style="text-align: center;">
        <h4 style="margin-bottom: 8px; font-size: 14px; color: #374151;">
          Small (32px)
        </h4>
        <ledger-lottie
          animationName="loadingSpinner"
          size="small"
          autoplay
          loop
        ></ledger-lottie>
      </div>
      <div style="text-align: center;">
        <h4 style="margin-bottom: 8px; font-size: 14px; color: #374151;">
          Medium (64px)
        </h4>
        <ledger-lottie
          animationName="loadingSpinner"
          size="medium"
          autoplay
          loop
        ></ledger-lottie>
      </div>
      <div style="text-align: center;">
        <h4 style="margin-bottom: 8px; font-size: 14px; color: #374151;">
          Large (128px)
        </h4>
        <ledger-lottie
          animationName="loadingSpinner"
          size="large"
          autoplay
          loop
        ></ledger-lottie>
      </div>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story:
          "Predefined sizes available: small (32px), medium (64px), and large (128px).",
      },
    },
  },
};

export const AnimationStates: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 20px;">
      <div>
        <h3
          style="margin-bottom: 12px; font-size: 14px; font-weight: 600; color: #374151;"
        >
          Playing and Looping
        </h3>
        <div style="display: flex; gap: 16px; align-items: center;">
          <ledger-lottie
            animationName="loadingSpinner"
            size="medium"
            autoplay
            loop
          ></ledger-lottie>
          <span style="font-size: 12px; color: #6b7280;"
            >Loading spinner (looping)</span
          >
        </div>
      </div>

      <div>
        <h3
          style="margin-bottom: 12px; font-size: 14px; font-weight: 600; color: #374151;"
        >
          Playing Once
        </h3>
        <div style="display: flex; gap: 16px; align-items: center;">
          <ledger-lottie
            animationName="checkmark"
            size="medium"
            autoplay
            ?loop=${false}
          ></ledger-lottie>
          <span style="font-size: 12px; color: #6b7280;"
            >Checkmark (plays once)</span
          >
        </div>
      </div>

      <div>
        <h3
          style="margin-bottom: 12px; font-size: 14px; font-weight: 600; color: #374151;"
        >
          Paused
        </h3>
        <div style="display: flex; gap: 16px; align-items: center;">
          <ledger-lottie
            animationName="loadingSpinner"
            size="medium"
            ?autoplay=${false}
            paused
          ></ledger-lottie>
          <span style="font-size: 12px; color: #6b7280;">Paused animation</span>
        </div>
      </div>
    </div>
  `,
};

export const TestLottieInteractions: Story = {
  args: {
    animationName: "checkmark",
    size: "large",
    autoplay: true,
    loop: false,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = shadowWithin(canvasElement);

    await step("Verify component renders", async () => {
      const lottieContainer = canvas.getByShadowRole("img");
      expect(lottieContainer).toBeInTheDocument();
      expect(lottieContainer).toHaveAttribute("aria-label", "Lottie animation");
    });

    await step("Check accessibility attributes", async () => {
      const lottieContainer = canvas.getByShadowRole("img");
      expect(lottieContainer).toHaveAttribute("role", "img");
      expect(lottieContainer).toHaveAttribute("aria-label", "Lottie animation");
    });
  },
  parameters: {
    docs: {
      description: {
        story:
          "Automated test story to verify component functionality and accessibility",
      },
    },
  },
};
