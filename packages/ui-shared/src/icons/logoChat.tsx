import { SVGProps } from "react";

export const LogoChat = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={32}
    height={32}
    fill="none"
    {...props}
  >
    <circle cx={16} cy={16} r={16} fill="#fff" />
    <path
      fill="#DD85FF"
      d="M22.935 22.638c0 1.219-1.46 1.822-2.3.95l-4.654-4.833-4.766-4.718c-.86-.852-.265-2.332.937-2.332h9.443c.74 0 1.34.609 1.34 1.36v9.573Z"
    />
    <path
      fill="#5C5BDB"
      d="M8.8 9.362c0-1.219 1.46-1.822 2.299-.95l4.654 4.833 4.766 4.718c.86.852.266 2.332-.936 2.332H10.14a1.35 1.35 0 0 1-1.34-1.36V9.363Z"
    />
  </svg>
);
