import { html } from "lit";

export default html`
  <svg
    width="40"
    height="41"
    viewBox="0 0 40 41"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g filter="url(#filter0_dd_info)">
      <path
        d="M20.0005 3.37549C29.1828 3.37562 36.6255 10.8181 36.6255 20.0005C36.6253 29.1827 29.1827 36.6254 20.0005 36.6255C10.8021 36.6255 3.37572 29.1817 3.37549 20.0005C3.37549 10.802 10.8191 3.37549 20.0005 3.37549ZM20.0005 18.8999C19.393 18.8999 18.8999 19.393 18.8999 20.0005V28.3335C18.9 28.941 19.393 29.4331 20.0005 29.4331C20.6077 29.4328 21.1 28.9408 21.1001 28.3335V20.0005C21.1001 19.3931 20.6078 18.9002 20.0005 18.8999ZM19.9751 12.2349C19.9726 12.2348 19.9698 12.2339 19.9673 12.2339C19.9239 12.2339 19.8805 12.2368 19.8384 12.2417C19.1177 12.3095 18.5478 12.875 18.4751 13.5942L18.4673 13.7505L18.4741 13.8979C18.5483 14.6328 19.169 15.2671 19.9839 15.2671C20.4295 15.2669 20.8028 15.0663 21.0513 14.8179C21.2997 14.5694 21.5004 14.1961 21.5005 13.7505C21.5005 12.908 20.8377 12.3094 20.1069 12.2407C20.1034 12.2403 20.0997 12.2392 20.0962 12.2388L19.9839 12.2339C19.9811 12.2339 19.9779 12.2348 19.9751 12.2349Z"
        fill="currentColor"
      />
    </g>
    <defs>
      <filter
        id="filter0_dd_info"
        x="-3"
        y="-2"
        width="46"
        height="46"
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
        <feGaussianBlur stdDeviation="1.5" />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"
        />
        <feBlend
          mode="normal"
          in2="BackgroundImageFix"
          result="effect1_dropShadow_info"
        />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feMorphology
          radius="1"
          operator="erode"
          in="SourceAlpha"
          result="effect2_dropShadow_info"
        />
        <feOffset dy="1" />
        <feGaussianBlur stdDeviation="1" />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"
        />
        <feBlend
          mode="normal"
          in2="effect1_dropShadow_info"
          result="effect2_dropShadow_info"
        />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect2_dropShadow_info"
          result="shape"
        />
      </filter>
    </defs>
  </svg>
`;
