import { ReactNode } from "react";

import { IWrapperProps, Wrapper } from "./styles";
import { Portal } from "../Portal";

export interface IModalProps extends IWrapperProps {
  open: boolean;
  children: ReactNode | ReactNode[];
  onClose?: () => void;
}

export * from "./ModalHeader";
export const Modal = (props: IModalProps) => {
  const { children, open, onClose, ...modalProps } = props;

  if (!open) return null;

  return (
    <Portal>
      <Wrapper {...modalProps}>
        <div className="modal-background" onClick={onClose} />
        <div className="modal-container">{children}</div>
      </Wrapper>
    </Portal>
  );
};
