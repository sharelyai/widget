import { Wrapper } from "./styles";

interface IDialog {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  buttonConfirmText?: string;
  buttonCancelText?: string;
}

export const Dialog = (props: IDialog) => {
  const {
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    buttonConfirmText,
    buttonCancelText,
  } = props;

  if (!isOpen) return null;

  return (
    <Wrapper>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <p className="modal-content-title">{title}</p>
          <p className="modal-content-description">{description}</p>
          <div className="modal-actions">
            <button
              className="btn modal-action-button-cancel"
              onClick={onClose}
            >
              {buttonCancelText}
            </button>
            <button
              className="btn modal-action-button-confirm"
              onClick={onConfirm}
            >
              {buttonConfirmText}
            </button>
          </div>
        </div>
      </div>
    </Wrapper>
  );
};
