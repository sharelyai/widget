/**
 * Search-view result list item.
 *
 * Shares all of its logic (type/icon/pdf resolution, derived flags, and the
 * click/download/preview handlers) with the browse view's `SearchResultCard`
 * via the `useResourceListItem` hook + the `ResourceIcon` component. This file
 * owns only the search-view styling and JSX layout (it adds the "View more"
 * dropdown and the `showPageAsPill`/trailing-page description variants).
 */
import { useState } from "react";
import styled, { css } from "styled-components";

import {
  Divider,
  Tooltip,
  ArrowDown,
  Download,
  Launch,
  ResourceIcon,
} from "@sharelyai/widget-ui-shared";
import {
  useResourceListItem,
  useLanguage,
  classNames,
} from "@sharelyai/widget-services";

const Container: any = styled.div`
  ${({ theme }) => css`
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
      background: ${({ theme }) => theme.colors.whiteLilac2};
    }

    @media (max-width: ${theme.screens.md}) {
      padding: 20px 16px;

      &:hover {
        background: ${({ theme }) => theme.colors.transparent};
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
          background: ${({ theme }) => theme.colors.whiteLilac2};

          & > svg {
            width: 24px;
            height: 24px;
            color: ${({ theme }) => theme.colors.paleSky};
            fill: ${({ theme }) => theme.colors.paleSky};
            transition: all 0.2s ease-in-out;
          }

          &.customIcon {
            background: ${({ theme }) => theme.colors.transparent};
          }

          &.pdf,
          &.mp4,
          &.png,
          &.jpeg,
          &.gif,
          &.webp {
            background: ${({ theme }) => theme.colors.cinnabar2}14;

            & > svg {
              color: ${({ theme }) => theme.colors.cinnabar2};
              fill: ${({ theme }) => theme.colors.cinnabar2};
            }
          }

          &.zip,
          &.rar {
            background: ${({ theme }) => theme.colors.athensGray2};

            & > svg {
              color: ${({ theme }) => theme.colors.mirage};
              fill: ${({ theme }) => theme.colors.mirage};
            }
          }

          &.mp3 {
            background: ${({ theme }) => theme.colors.selectiveYellow}14;

            & > svg {
              color: ${({ theme }) => theme.colors.selectiveYellow};
              fill: ${({ theme }) => theme.colors.selectiveYellow};
            }
          }

          &.doc,
          &.docx {
            background: ${({ theme }) => theme.colors.cornflowerBlue}14;

            & > svg {
              color: ${({ theme }) => theme.colors.cornflowerBlue};
              fill: ${({ theme }) => theme.colors.cornflowerBlue};
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
              color: ${({ theme }) => theme.colors.ebony};
              text-overflow: ellipsis;
              font-size: ${({ theme }) => theme.fonts.base};
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
              background: ${({ theme }) => theme.colors.athensGray4};
              color: ${({ theme }) => theme.colors.ebony};
              font-size: ${({ theme }) => theme.fonts.xs};
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
            color: ${({ theme }) => theme.colors.fiord};
            font-size: ${({ theme }) => theme.fonts.xs};
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
              background: ${({ theme }) => theme.colors.athensGray4};
              font-size: ${({ theme }) => theme.fonts.xs};
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
            color: ${({ theme }) => theme.colors.paleSky};
            fill: ${({ theme }) => theme.colors.paleSky};
            transition: all 0.2s ease-in-out;
          }
        }
      }
    }

    & > .description {
      overflow: hidden;
      color: ${({ theme }) => theme.colors.fiord};
      text-overflow: ellipsis;
      font-size: ${({ theme }) => theme.fonts.base};
      font-style: normal;
      font-weight: 400;
      line-height: 150%;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    & > .tags {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
      max-height: 0;
      overflow: hidden;
      transition:
        max-height 0.3s ease-in-out,
        opacity 0.3s ease-in-out;
      opacity: 0;

      &.show {
        max-height: 200px;
        opacity: 1;
      }

      & > .tag {
        background: none;
        border: none;
        cursor: pointer;
        display: flex;
        height: 32px;
        padding: 2px 16px;
        justify-content: center;
        align-items: center;
        gap: 6px;
        border-radius: 16px;
        border: 1px solid ${({ theme }) => theme.colors.athensGray2};
        color: ${({ theme }) => theme.colors.OxfordBlue};
        text-align: center;
        font-size: ${({ theme }) => theme.fonts.sm};
        font-style: normal;
        font-weight: 500;
        line-height: 110%;

        &:hover {
          border: 1px solid ${({ theme }) => theme.colors.indigo};
          color: ${({ theme }) => theme.colors.indigo};
        }
      }
    }
  `}
`;

type ComponentProps = {
  id: string;
  description: string;
  score?: number;
  metadata: any;
  showDropdown?: boolean;
};

const RelevantScore = ({ score }: { score: number }) => {
  const percent = (score * 100).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  });
  return <span className="item">{percent}% Relevant</span>;
};

export const ListSearchItem = (props: ComponentProps) => {
  const { showDropdown = false, ...item } = props;

  const [showMore, setShowMore] = useState(false);

  const { langText } = useLanguage();

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
    showPageAsPill,
    handleDownload,
    handleOpenInFullView,
    handleContainerClick,
  } = useResourceListItem(item);

  return (
    <Container
      onClick={handleContainerClick}
      {...(customConfig && { style: customConfig.styles })}
    >
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
              <span
                className={classNames("title", {
                  italic: isChunk,
                })}
              >
                {title}
              </span>
              {showPill && (isChunk || isFile) && (
                <span className="pill">
                  {isChunk ? langText.ContentText : langText.FileText}
                </span>
              )}
            </div>
            <span className="description">
              {showPageAsPill && page && (
                <span className="item pill">
                  {langText.PageText} {page}{" "}
                </span>
              )}
              {sourceName && <span className="item">{sourceName}</span>}
              {item?.score != null && item.score > 0 && (
                <>
                  <Divider type="dot" />
                  <RelevantScore score={item.score} />
                </>
              )}
              {page && !showPageAsPill && (
                <>
                  <Divider type="dot" />
                  <span className="item">
                    {langText.PageText} {page}{" "}
                  </span>
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
          {showDropdown && (
            <Tooltip text="View more">
              <button
                className={classNames("icon", { active: showMore })}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMore((prev) => !prev);
                }}
              >
                <ArrowDown />
              </button>
            </Tooltip>
          )}
        </div>
      </div>
      {showDescription && <div className="description">{description}</div>}
    </Container>
  );
};
