import { ReactElement, ReactNode, useEffect } from "react";

import { AlertWrapper } from "./styles";
import { TIME_AUTO_HIDE_DURATION } from "@sharelyai/widget-services";

interface IAlertProps {
  isOpen: boolean;
  children: ReactNode;
  onClose: () => void;
  icon?: ReactElement;
}

export const Alert = (props: IAlertProps) => {
  const { children, icon, isOpen, onClose } = props;

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      onClose();
    }, TIME_AUTO_HIDE_DURATION);

    return () => {
      clearTimeout(timer);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AlertWrapper onClick={onClose}>
      {icon && (
        <div className="sharelyai-webcontroller-icon-alert-body">{icon}</div>
      )}
      {children}
    </AlertWrapper>
  );
};
