import React from "react";
import { Wrapper } from "./styles";
import { LogoChat as Logo } from "@sharelyai/widget-ui-shared";
import { useGlobalStore, useLanguage } from "@sharelyai/widget-services";
import { Title } from "./components/title";

export interface SuggestedQuestionsProps {
  imageAI: string;
  greeting: string;
  renderInputSection?: () => React.ReactNode;
  version?: string;
  onVersionClick?: () => void;
}

export const SuggestedQuestions = (props: SuggestedQuestionsProps) => {
  const { greeting, imageAI, renderInputSection, version, onVersionClick } =
    props;
  const { workspace } = useGlobalStore();
  const { langText } = useLanguage();

  const customConfig = workspace?.spaceStyling?.customConfig?.container;
  const hasCustomConfig = Boolean(customConfig);
  const hasCustomTitle = Boolean(
    workspace?.spaceStyling?.customConfig?.views?.chat?.title,
  );

  return (
    <Wrapper>
      <div className="sharelyai-webcontroller-first-view">
        {hasCustomTitle && <Title />}
        {!hasCustomTitle && (
          <div className="sharelyai-webcontroller-greeting">
            {imageAI ? <img src={imageAI} alt="logo" /> : <Logo />}
            <p>{greeting}</p>
          </div>
        )}
        {renderInputSection && (
          <div className="sharelyai-webcontroller-input-section">
            {renderInputSection()}
          </div>
        )}
        <div className="sharelyai-webcontroller-body">
          {hasCustomConfig && (
            <div className="sharelyai-webcontroller-note">
              <span>
                {langText.NoteChatPoweredByAIText}
                {version && (
                  <>
                    {" "}
                    <button
                      type="button"
                      className="sharelyai-webcontroller-note-version"
                      onClick={onVersionClick}
                    >
                      (v{version})
                    </button>
                  </>
                )}
              </span>
            </div>
          )}
        </div>
      </div>
    </Wrapper>
  );
};
