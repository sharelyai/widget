import {
  useGlobalStore as useGlobalState,
  useLanguage,
} from "@sharelyai/widget-services";
import styled, { css } from "styled-components";

export const Wrapper: any = styled.div`
  ${({ theme }) => css`
    display: flex;
    width: 100%;
    padding: 44px 120px 24px 120px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 8px;

    @media (max-width: ${theme.screens.sm}) {
      padding: 40px 16px 12px 16px;
    }

    & > .title {
      color: ${theme.colors.shark};
      text-align: center;
      font-size: ${theme.fonts.xl};
      font-style: normal;
      font-weight: 600;
      line-height: normal;

      @media (max-width: ${theme.screens.sm}) {
        max-width: 282px;
      }
    }

    & > .subtitle {
      color: ${theme.colors.gullGray};
      text-align: center;
      font-size: ${theme.fonts.base};
      font-style: normal;
      line-height: normal;

      @media (max-width: ${theme.screens.sm}) {
        max-width: 282px;
      }
    }
  `}
`;

export const Title = () => {
  const { workspace } = useGlobalState();
  const { langText } = useLanguage();

  const customConfig = workspace?.spaceStyling?.customConfig?.views?.browse;
  const hasCustomConfig = Boolean(customConfig);

  return (
    <Wrapper {...(hasCustomConfig && { style: customConfig?.styles })}>
      <span
        className="title"
        {...(hasCustomConfig && { styles: customConfig?.title?.styles })}
      >
        {!hasCustomConfig && langText.ExploreDocumentsText}
        {(hasCustomConfig && langText?.[customConfig?.title?.content]) ||
          customConfig?.title?.content}
      </span>
      {hasCustomConfig && customConfig?.subtitle && (
        <span
          className="subtitle"
          {...(hasCustomConfig && { styles: customConfig?.subtitle?.styles })}
        >
          {langText?.[customConfig?.subtitle?.content] ||
            customConfig?.subtitle?.content}
        </span>
      )}
    </Wrapper>
  );
};
