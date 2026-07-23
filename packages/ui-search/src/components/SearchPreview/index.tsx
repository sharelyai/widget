import { useEffect, useState } from "react";
import styled from "styled-components";

import {
  Tooltip,
  Divider,
  Close,
  Download,
  Interests,
  Launch,
} from "@sharelyai/widget-ui-shared";
import {
  regex,
  useGlobalStore,
  useSharelyContext,
  getSourcePageNumber,
  withPdfPage,
} from "@sharelyai/widget-services";

export const Wrapper: any = styled.div`
  ${({ theme }: { theme: any }) => `
  & > .header {
    display: flex;
    padding: 24px 24px 6px 24px;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    align-self: stretch;
    width: 100%;

    & > .content {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
      flex: 1 0 0;
      width: 70%;

      & > .title {
        color: ${theme.colors.ebony};
        font-size: ${theme.fonts.xl};
        font-style: normal;
        font-weight: 600;
        line-height: 140%;
        display: -webkit-box;
        overflow: hidden;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
      }

      & > .description {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 6px;
        color: ${theme.colors.fiord};
        font-size: ${theme.fonts.sm};
        font-style: normal;
        font-weight: 400;
        line-height: 110%;
      }
    }

    & > .actions {
      display: flex;
      align-items: center;
      gap: 16px;

      button {
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;

        svg {
          width: 24px;
          height: 24px;
          color: ${theme.colors.paleSky};
          fill: ${theme.colors.paleSky};
        }
      }
    }
  }

  & > .sub-header {
    display: flex;
    padding: 20px 24px;
    align-self: stretch;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 12px;

    & > .title {
      display: flex;
      align-items: center;
      gap: 4px;

      & > svg {
        width: 18px;
        height: 18px;
        fill: ${theme.colors.paleSky};
      }

      & > span {
        color: ${theme.colors.ebony};
        font-size: ${theme.fonts.sm};
        font-style: normal;
        font-weight: 600;
        line-height: 110%;
      }
    }

    & > .container {
      display: flex;
      align-items: center;
      gap: 8px;

      & > .item {
        background: none;
        border: none;
        padding: 0;
        display: flex;
        height: 32px;
        padding: 2px 16px;
        justify-content: center;
        align-items: center;
        gap: 6px;
        border-radius: 16px;
        border: 1px solid ${theme.colors.athensGray6};
        cursor: pointer;
      }
    }
  }

  & > .body {
    display: flex;
    padding: 32px 24px 0px 24px;
    flex-direction: column;
    align-items: center;
    gap: 32px;
    flex: 1 0 0;
    align-self: stretch;
    background: ${theme.colors.athensGray5};
    overflow: hidden;

    & > .preview {
      display: flex;
      padding: 44px;
      flex-direction: column;
      align-items: flex-start;
      gap: 32px;
      align-self: stretch;
      background: ${theme.colors.white};
      box-shadow: ${theme.shadows.lowDepthShadow};
      width: 100%;
      height: 98%;

      & > .header {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
        align-self: stretch;

        & > .title {
          color: ${theme.colors.ebony};
          font-size: ${theme.fonts.xl};
          font-style: normal;
          font-weight: 600;
          line-height: 140%;
        }

        & > .description {
          color: ${theme.colors.fiord};
          font-size: ${theme.fonts.base};
          font-style: normal;
          font-weight: 400;
          line-height: 140%;
        }
      }
    }
  }
  `}
`;

const RelevantScore = ({ score }: { score: number }) => {
  const percent = (score * 100).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  });
  return <span>{percent}% relevant</span>;
};

export const SearchPreview = (props: any) => {
  const { onClose, item } = props;

  const [downloadFile, setDownloadFile] = useState({ url: "" });

  useGlobalStore();
  const { apiClient } = useSharelyContext();

  const blobType = item.metadata?.["blobType"];
  const isPdf = blobType === "application/pdf";
  const hasToShowOpenInFullView = isPdf;
  const title =
    item.metadata?.["elasticSearch.title.raw"] ??
    item?.metadata?.["text"] ??
    "";
  const sourceName =
    item?.metadata?.["filename"] ?? item?.metadata?.["elasticSearch.url.raw"];

  useEffect(() => {
    const handleFile = async () => {
      const responseDownload = await apiClient.knowledge.downloadFile(
        item.metadata?.["knowledgeId"],
      );
      setDownloadFile(responseDownload);
    };

    handleFile();
  }, [item.metadata, apiClient.knowledge]);

  const handleClose = () => {
    onClose();
  };

  const handleOpenInFullView = async (e: any) => {
    e.stopPropagation();
    if (downloadFile?.url) {
      const cleanUrl = downloadFile?.url?.replace(regex.GET_DOWNLOAD_WORD, "");
      const pageNumber = getSourcePageNumber(item as any);
      window.open(withPdfPage(cleanUrl, pageNumber), "_blank");
    }
  };

  const handleDownload = async (e: any) => {
    e.stopPropagation();
    if (downloadFile?.url) {
      const url = downloadFile.url;
      const parsedUrl = new URL(url);
      const downloadValue = parsedUrl.searchParams.get("download");

      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = downloadValue || "download.pdf";

      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    }
  };

  return (
    <Wrapper>
      <div className="header">
        <div className="content">
          <span className="title">{title}</span>
          <span className="description">
            {sourceName && (
              <>
                <span className="item">{sourceName} </span>
                <Divider type="dot" />
              </>
            )}
            {item?.score && <RelevantScore score={item.score} />}
          </span>
        </div>
        <div className="actions">
          <Tooltip text="Download">
            <button className="icon" onClick={handleDownload}>
              <Download />
            </button>
          </Tooltip>
          {hasToShowOpenInFullView && (
            <Tooltip text="Open in full view">
              <button className="icon" onClick={handleOpenInFullView}>
                <Launch />
              </button>
            </Tooltip>
          )}
          <Tooltip text="Close" placement="bottom">
            <button className="close-preview" onClick={handleClose}>
              <Close />
            </button>
          </Tooltip>
        </div>
      </div>
      <div className="sub-header">
        <span className="title">
          <Interests />
          <span className="item">4 Categories</span>
        </span>
        <div className="container">
          {Array(0)
            .fill(0)
            .map((_, index) => {
              return (
                <button className="item" key={index}>
                  category {index + 1}
                </button>
              );
            })}
        </div>
      </div>
      <div className="body">
        <div className="preview">
          <div className="header">
            <span className="title">{title}</span>
            <span className="description">{item?.description}</span>
          </div>
        </div>
      </div>
    </Wrapper>
  );
};
