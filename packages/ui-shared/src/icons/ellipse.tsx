import { SVGProps } from "react";

export const Ellipse = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={3}
    height={4}
    fill="none"
    {...props}
  >
    <circle cx={1.5} cy={2} r={1.5} fill="#475467" />
  </svg>
);
