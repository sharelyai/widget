import { IconBtn } from "../styles";

interface IconButtonProps {
  icon: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  active?: boolean;
  tooltip?: string;
  ariaLabel?: string;
  ariaPressed?: boolean;
  className?: string;
}

export function IconButton({
  icon,
  onClick,
  active,
  tooltip,
  ariaLabel,
  ariaPressed,
  className,
}: IconButtonProps) {
  return (
    <IconBtn
      onClick={onClick}
      $active={active}
      data-tooltip={tooltip}
      aria-label={ariaLabel || tooltip}
      aria-pressed={ariaPressed}
      className={className}
    >
      {icon}
    </IconBtn>
  );
}
