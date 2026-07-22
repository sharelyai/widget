"use client";
import { useRef } from "react";
import { flip, offset, useFloating } from "@floating-ui/react";

import {
  AnchorBoxWrapper,
  AnchorMarkdown,
  AnchorMarkdownContainer,
  AnchorBoxWrapperReferences,
} from "./styles";
import {
  constants,
  regex,
  customEvents,
  useSharelyContext,
  useLanguage,
  resolveSourceUrl,
} from "@sharelyai/widget-services";
import { useAnchorStore } from "./anchorStore";
import { useResponsive } from "../../../../../hooks/useResponsive";

export const Anchor = ({ node, ...props }: any) => {
  const anchorUUID = useRef(crypto.randomUUID());
  const { isHovered, setIsHovered, currentHref, knowledgeId, setKnowledgeId } =
    useAnchorStore();
  const { apiClient } = useSharelyContext();
  const { refs, floatingStyles } = useFloating({
    placement: props?.sourcesMetadata ? "top-start" : "bottom",
    middleware: [
      offset({
        mainAxis: 10,
      }),
      flip(),
    ],
  });
  const { isMobile } = useResponsive();
  const { t } = useLanguage();
  const langText = {
    NoPreviewAvailableText: t("NoPreviewAvailableText"),
    DownloadingText: t("DownloadingText"),
    SourceText: t("SourceText"),
    PageText: t("PageText"),
    RelevanceText: t("RelevanceText"),
    ContentPreviewText: t("ContentPreviewText"),
  };
  const referenceId = props?.href
    ?.replace(constants.PAGE_NUMBER_DOCUMENT_DOWNLOAD_URL, "")
    ?.replaceAll("____", " ");
  const sourcesMetadata = props?.sourcesMetadata;
  const findSourceMetadata = sourcesMetadata?.find(
    (source: any) => source?.metadata?.source === referenceId,
  );
  const sourceKnowledgeId = findSourceMetadata?.metadata?.knowledgeId;
  const externalUrl = findSourceMetadata
    ? resolveSourceUrl({
        id: findSourceMetadata.metadata?.knowledgeId || "",
        type: "knowledge",
        title: "",
        snippet:
          findSourceMetadata.metadata?.snippet ||
          findSourceMetadata.metadata?.text,
        metadata: {
          sourceUrl: findSourceMetadata.metadata?.sourceUrl,
          source: findSourceMetadata.metadata?.source,
        },
      } as any)
    : undefined;
  const isDocument = props?.href?.includes(
    constants.PAGE_NUMBER_DOCUMENT_DOWNLOAD_URL,
  );
  const title = (() => {
    const metadataTitle = findSourceMetadata?.metadata?.title;
    if (metadataTitle) return metadataTitle;
    const source = findSourceMetadata?.metadata?.source;
    const pdfTitle = findSourceMetadata?.metadata?.["pdf.info.Title"];
    if (pdfTitle) return pdfTitle;
    if (source && !/^https?:\/\//.test(source)) {
      return source.split(":")?.[1] || "Unknown Source";
    }
    return source;
  })();
  const pageNumber =
    findSourceMetadata?.metadata?.loc?.pageNumber ??
    findSourceMetadata?.metadata?.["loc.pageNumber"] ??
    findSourceMetadata?.metadata?.pageNumber;
  const relevancePercentage = (findSourceMetadata?.score * 100).toFixed(3);
  const rawPreview = findSourceMetadata?.metadata?.text;
  const contentPreview = rawPreview
    ? rawPreview.replace(/<[^>]*>/g, "").trim()
    : "";
  const hasSourceData = !!(findSourceMetadata && (title || contentPreview));
  const keyAnchorElement =
    props?.href + "_" + props?.messageId + "_" + anchorUUID.current;

  const handleHover = (value: boolean) => {
    setIsHovered({ [keyAnchorElement]: value });
  };

  const handleDownloadDocument = async (event: any) => {
    event?.stopPropagation();
    if (externalUrl) {
      window.open(externalUrl, "_blank");
      return;
    }

    const basicHref = isDocument ? undefined : props.href;

    if (!isDocument) {
      window.open(basicHref, "_blank");
      return;
    }

    if (!sourceKnowledgeId) {
      return;
    }

    setKnowledgeId({ isLoading: true });

    try {
      const responseDocument = await apiClient.knowledge.downloadFile(
        sourceKnowledgeId,
        pageNumber,
      );

      if (responseDocument?.url) {
        const cleanUrl = responseDocument?.url?.replace(
          regex.GET_DOWNLOAD_WORD,
          "",
        );

        if (cleanUrl.includes("pdf")) {
          // Trigger PDF preview modal via custom event
          customEvents.publish(constants.CUSTOM_EVENTS.OPEN_PDF_PREVIEW, {
            url: cleanUrl,
            fileName: findSourceMetadata
              ? title
              : props?.children?.toString() || "Document",
            pageNumber: pageNumber || 1,
          });
        } else {
          // For non-PDF files, open in new window
          const newWindow = window.open("about:blank", "_blank");
          if (newWindow) newWindow.location.href = cleanUrl;
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setKnowledgeId({ isLoading: false });
    }
  };

  return (
    <AnchorMarkdownContainer
      {...props}
      onClick={handleDownloadDocument}
      onMouseEnter={() => handleHover(true)}
      onMouseLeave={() => handleHover(false)}
      ref={refs.setReference}
    >
      <AnchorMarkdown>
        <span>{props.children}</span>
      </AnchorMarkdown>
      {!findSourceMetadata && currentHref && (
        <AnchorBoxWrapper
          ref={refs.setFloating}
          style={{
            ...floatingStyles,
            visibility: isHovered?.[keyAnchorElement] ? "visible" : "hidden",
            opacity: isHovered?.[keyAnchorElement] ? 1 : 0,
          }}
        >
          {knowledgeId?.isLoading ? langText.DownloadingText : currentHref}
        </AnchorBoxWrapper>
      )}

      {!isMobile && hasSourceData && (
        <AnchorBoxWrapperReferences
          ref={refs.setFloating}
          style={{
            ...floatingStyles,
            visibility: isHovered?.[keyAnchorElement] ? "visible" : "hidden",
            opacity: isHovered?.[keyAnchorElement] ? 1 : 0,
          }}
        >
          {title && (
            <div className="space">
              <span className="title">{langText.SourceText}</span>
              <span className="description">{title}</span>
            </div>
          )}
          {Boolean(pageNumber) && pageNumber > 0 && (
            <div className="space">
              <span className="title">{langText.PageText}</span>
              <span className="description">{pageNumber}</span>
            </div>
          )}
          <div className="space">
            <span className="title">{langText.RelevanceText}</span>
            <span className="description">{relevancePercentage}</span>
          </div>
          {contentPreview && (
            <div className="space">
              <span className="title">{langText.ContentPreviewText}</span>
              <span className="description">{contentPreview}</span>
            </div>
          )}
        </AnchorBoxWrapperReferences>
      )}
    </AnchorMarkdownContainer>
  );
};
