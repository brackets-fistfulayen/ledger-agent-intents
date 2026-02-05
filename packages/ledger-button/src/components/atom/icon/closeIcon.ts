import { html } from "lit";

export const CloseIcon = html`
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    aria-hidden="true"
    focusable="false"
    fill="none"
  >
    <path d="M3.3335 3.33334L12.6668 12.6667L3.3335 3.33334Z" fill="white" />
    <path d="M12.6668 3.33334L3.3335 12.6667L12.6668 3.33334Z" fill="white" />
    <path
      d="M3.3335 3.33334L12.6668 12.6667M12.6668 3.33334L3.3335 12.6667"
      stroke="white"
      stroke-width="1.3"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
`;

export default CloseIcon;
