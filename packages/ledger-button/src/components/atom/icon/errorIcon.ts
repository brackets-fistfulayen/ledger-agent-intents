import { html } from "lit";

export const ErrorIcon = html`
  <svg
    width="42"
    height="42"
    viewBox="0 0 42 42"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <g filter="url(#filter0_d_695_5)">
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M4.75 20C4.75 11.0088 12.0255 3.75 21 3.75C29.9754 3.75 37.25 11.0246 37.25 20C37.25 28.9754 29.9754 36.25 21 36.25C12.0088 36.25 4.75 28.9745 4.75 20ZM17.1671 14.3994C16.6789 13.9113 15.8875 13.9113 15.3993 14.3994C14.9112 14.8876 14.9112 15.6791 15.3993 16.1672L19.2321 20L15.3993 23.8328C14.9112 24.3209 14.9112 25.1124 15.3993 25.6005C15.8875 26.0887 16.6789 26.0887 17.1671 25.6005L20.9999 21.7678L24.8327 25.6005C25.3208 26.0887 26.1123 26.0887 26.6004 25.6005C27.0886 25.1124 27.0886 24.3209 26.6004 23.8328L22.7676 20L26.6004 16.1672C27.0886 15.6791 27.0886 14.8876 26.6004 14.3994C26.1123 13.9113 25.3208 13.9113 24.8327 14.3994L20.9999 18.2322L17.1671 14.3994Z"
        fill="#F87274"
      />
    </g>
    <defs>
      <filter
        id="filter0_d_695_5"
        x="-3"
        y="-3"
        width="48"
        height="48"
        filterUnits="userSpaceOnUse"
        color-interpolation-filters="sRGB"
      >
        <feFlood flood-opacity="0" result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset dy="1" />
        <feGaussianBlur stdDeviation="2" />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.16 0"
        />
        <feBlend
          mode="normal"
          in2="BackgroundImageFix"
          result="effect1_dropShadow_695_5"
        />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect1_dropShadow_695_5"
          result="shape"
        />
      </filter>
    </defs>
  </svg>
`;

export default ErrorIcon;
