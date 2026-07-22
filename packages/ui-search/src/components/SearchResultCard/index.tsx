import styled, { css } from "styled-components";

import {
  Divider,
  Tooltip,
  Download,
  Launch,
  ResourceIcon,
} from "@sharelyai/widget-ui-shared";
import {
  useLanguage,
  useResourceListItem,
  classNames,
} from "@sharelyai/widget-services";

const Container: any = styled.div`
  ${({ theme }: { theme: any }) => css`
    display: flex;
    padding: 20px;
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    align-self: stretch;
    cursor: pointer;
    width: 99%;
    transition: all 0.2s ease-in-out;
    border-bottom: 1px solid ${theme.colors.athensGray2};

    &:hover {
      background: ${theme.colors.whiteLilac2};
    }

    @media (max-width: ${theme.screens.md}) {
      padding: 20px 16px;

      &:hover {
        background: ${theme.colors.transparent};
      }
    }

    & > .wrapper-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;

      & > .title {
        display: flex;
        align-items: center;
        gap: 12px;
        overflow: hidden;

        @media (max-width: ${theme.screens.md}) {
          width: 80%;
        }

        & > .icon {
          display: flex;
          width: 36px;
          height: 36px;
          padding: 8px;
          justify-content: center;
          align-items: center;
          gap: 10px;
          border-radius: 8px;
          background: ${theme.colors.whiteLilac2};

          & > svg {
            width: 24px;
            height: 24px;
            color: ${theme.colors.paleSky};
            fill: ${theme.colors.paleSky};
            transition: all 0.2s ease-in-out;
          }

          &.customIcon {
            background: ${theme.colors.transparent};
          }

          &.pdf,
          &.mp4,
          &.png,
          &.jpeg,
          &.gif,
          &.webp {
            background: ${theme.colors.cinnabar2}14;
            & > svg {
              color: ${theme.colors.cinnabar2};
              fill: ${theme.colors.cinnabar2};
            }
          }

          &.zip,
          &.rar {
            background: ${theme.colors.athensGray2};
            & > svg {
              color: ${theme.colors.mirage};
              fill: ${theme.colors.mirage};
            }
          }

          &.mp3 {
            background: ${theme.colors.selectiveYellow}14;
            & > svg {
              color: ${theme.colors.selectiveYellow};
              fill: ${theme.colors.selectiveYellow};
            }
          }

          &.doc,
          &.docx {
            background: ${theme.colors.cornflowerBlue}14;
            & > svg {
              color: ${theme.colors.cornflowerBlue};
              fill: ${theme.colors.cornflowerBlue};
            }
          }
        }

        & > .content {
          display: flex;
          flex-direction: column;
          gap: 6px;
          width: 100%;
          overflow: hidden;

          & > .wrapper-title {
            display: flex;
            align-items: center;
            gap: 6px;
            width: 100%;
            overflow: hidden;

            & > .title {
              overflow: hidden;
              color: ${theme.colors.ebony};
              text-overflow: ellipsis;
              font-size: ${theme.fonts.base};
              font-style: normal;
              font-weight: 600;
              line-height: 110%;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;

              &.italic {
                font-style: italic;
              }
            }

            & > .pill {
              display: flex;
              padding: 3px 6px;
              justify-content: center;
              align-items: center;
              gap: 10px;
              border-radius: 100px;
              background: ${theme.colors.athensGray4};
              color: ${theme.colors.ebony};
              font-size: ${theme.fonts.xs};
              font-style: normal;
              font-weight: 500;
              line-height: 110%;
            }
          }

          & > .description {
            display: flex;
            align-items: center;
            gap: 8px;
            align-self: stretch;
            color: ${theme.colors.fiord};
            font-size: ${theme.fonts.xs};
            font-style: normal;
            font-weight: 400;
            line-height: 110%;
            width: 100%;
            flex-wrap: wrap;

            & > .item {
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }

            & > .pill {
              display: flex;
              padding: 3px 6px;
              justify-content: center;
              align-items: center;
              gap: 10px;
              border-radius: 100px;
              background: ${theme.colors.athensGray4};
              font-size: ${theme.fonts.xs};
              font-style: normal;
              font-weight: 500;
              line-height: 110%;
              width: max-content;
            }
          }
        }
      }

      & > .actions {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 8px;

        .icon {
          border: none;
          background: none;
          padding: 0;
          cursor: pointer;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;

          &.active {
            & > svg {
              transform: rotate(180deg);
            }
          }

          & > svg {
            width: 24px;
            height: 24px;
            color: ${theme.colors.paleSky};
            fill: ${theme.colors.paleSky};
            transition: all 0.2s ease-in-out;
          }
        }
      }
    }

    & > .description {
      overflow: hidden;
      color: ${theme.colors.fiord};
      text-overflow: ellipsis;
      font-size: ${theme.fonts.base};
      font-style: normal;
      font-weight: 400;
      line-height: 150%;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
  `}
`;

const RelevantScore = ({ score }: { score: number }) => {
  const percent = (score * 100).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  });
  return <span className="item">{percent}% Relevant</span>;
};

export const SearchResultCard = (props: any) => {
  const { ...item } = props;

  const { langText: t } = useLanguage();

  const {
    iconType,
    iconExtension,
    isChunk,
    isFile,
    isDownloadable,
    hasToShowOpenInFullView,
    title,
    description,
    sourceName,
    page,
    customIcons,
    hasCustomIcon,
    customConfig,
    showDescription,
    showPill,
    showOpenInFullView,
    handleDownload,
    handleOpenInFullView,
    handleContainerClick,
  } = useResourceListItem(item);

  return (
    <Container onClick={handleContainerClick}>
      <div className="wrapper-title">
        <div className="title">
          <div
            className={classNames("icon", {
              [iconExtension ?? ""]: !hasCustomIcon && Boolean(iconExtension),
              customIcon: hasCustomIcon,
            })}
          >
            <ResourceIcon
              iconType={iconType}
              isChunk={isChunk}
              customIcons={customIcons}
            />
          </div>
          <div className="content">
            <div className="wrapper-title">
              <span className={classNames("title", { italic: isChunk })}>
                {title}
              </span>
              {showPill && (isChunk || isFile) && (
                <span className="pill">
                  {isChunk ? t.ContentText : t.FileText}
                </span>
              )}
            </div>
            <span className="description">
              {customConfig?.showPageAsPill && page && (
                <span className="item pill">
                  {t.PageText} {page}{" "}
                </span>
              )}
              {sourceName && <span className="item">{sourceName}</span>}
              {item?.score > 0 && (
                <>
                  <Divider type="dot" />
                  <RelevantScore score={item.score} />
                </>
              )}
            </span>
          </div>
        </div>
        <div className="actions">
          {hasToShowOpenInFullView && showOpenInFullView && (
            <Tooltip text="Open in full view">
              <button className="icon" onClick={handleOpenInFullView}>
                <Launch />
              </button>
            </Tooltip>
          )}
          {isDownloadable && (
            <Tooltip text="Download">
              <button className="icon" onClick={handleDownload}>
                <Download />
              </button>
            </Tooltip>
          )}
        </div>
      </div>
      {showDescription && <div className="description">{description}</div>}
    </Container>
  );
};
