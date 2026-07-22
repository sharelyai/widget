import { ReactNode } from "react";

import { IWrapperProps, Wrapper } from "./styles";

interface IEmptyPageProps extends Partial<IWrapperProps> {
  icon?: ReactNode;
  text?: string;
  description?: string;
  button?: ReactNode;
  buttonAction?: ReactNode;
}

export const EmptyState = (props: IEmptyPageProps) => {
  const { icon, text, description, button, buttonAction, ...wrapperProps } =
    props;

  // Validation: if no content is provided, render nothing
  if (!icon && !text && !description && !button && !buttonAction) {
    return null;
  }

  return (
    <Wrapper {...wrapperProps}>
      <div className="space-container-empty-chat">
        <div className="space-container-empty-chat-empty">
          {icon && (
            <div className="space-container-empty-chat-empty-picture">
              {icon}
            </div>
          )}
          {text && (
            <p className="space-container-empty-chat-empty-text">{text}</p>
          )}
          {description && (
            <p className="space-container-empty-chat-subtext">{description}</p>
          )}
          {(button || buttonAction) && (
            <div className="buttons-container">
              {button && <div className="buttons-starting">{button}</div>}
              {buttonAction && (
                <div className="optional-button-action">{buttonAction}</div>
              )}
            </div>
          )}
        </div>
      </div>
    </Wrapper>
  );
};
