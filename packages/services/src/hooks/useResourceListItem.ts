import { useGlobalStore } from "../stores/globalStore";
import { useSharelyContext } from "../provider";
import { constants } from "../constants";
import { customEvents } from "../utils/customEvents";
import { regex } from "../utils/regex";

export interface ResourceListItemOptions {
  /**
   * Analytics event published on click. Defaults to the search-result event so
   * the browse and search views keep their current (identical) behavior.
   */
  analyticsEvent?: string;
  /** `customConfig.views.<view>.results.listItem` key to read styling from. */
  customConfigView?: "search" | "browse";
}

/**
 * Shared logic for resource list items rendered in the search and browse views.
 *
 * Both views render near-identical rows (search: `SearchResults/listSearchItem`,
 * browse: `SearchResultCard`). The data resolution (type/icon/pdf detection),
 * the derived flags, and the click/download/preview handlers are identical, so
 * they live here. The components keep only their own styles + JSX layout.
 *
 * Type resolution is metadata-agnostic: when `blobType` is missing it is
 * inferred from the file extension, so the correct icon, styling, and PDF
 * preview work even for resources that arrive without a mimetype.
 */
export const useResourceListItem = (
  item: any,
  options: ResourceListItemOptions = {},
) => {
  const {
    analyticsEvent = constants.SPACE_EVENTS.SPACE_EVENT_CLICKED_SEARCH_RESULT,
    customConfigView = "search",
  } = options;

  const { workspace, currentInformation } = useGlobalStore();
  const { apiClient } = useSharelyContext();

  const rawUploadFileMeta =
    item?.metadata?.["uploadFileMetadata"] ?? item?.["uploadFileMetadata"];
  const uploadFileMeta = Array.isArray(rawUploadFileMeta)
    ? rawUploadFileMeta[0]
    : rawUploadFileMeta;

  const blobType =
    item?.metadata?.["blobType"] ||
    item?.metadata?.["mimeType"] ||
    item?.metadata?.["mimetype"] ||
    uploadFileMeta?.["mimetype"] ||
    item?.metadata?.["type"] ||
    item?.metadata?.["elasticSearch.url_scheme.raw"];

  // Resolve the file name from every candidate field so we can infer the type
  // (icon + preview) from its extension when `blobType` metadata is missing.
  const resolvedFileName =
    item?.metadata?.["filename"] ||
    item?.metadata?.["title"] ||
    item?.metadata?.["elasticSearch.url.raw"] ||
    item?.metadata?.["source"] ||
    item?.metadata?.["link"] ||
    uploadFileMeta?.["filename"] ||
    "";
  const fileExtension =
    resolvedFileName.split(/[?#]/)[0].split(".").pop()?.toLowerCase() ?? "";
  const inferredBlobType = constants.EXTENSION_TO_MIMETYPE?.[fileExtension];
  // Prefer an explicit, recognized blobType; otherwise fall back to the type
  // inferred from the extension so the right icon/styling/preview are used.
  const iconType =
    (blobType && constants.MIMETYPE_TO_EXTENSION?.[blobType]
      ? blobType
      : inferredBlobType) ||
    blobType ||
    constants.MIMETYPE_TEXT;
  const iconExtension = constants.MIMETYPE_TO_EXTENSION?.[iconType];

  const customIcons = workspace?.spaceStyling?.icons;
  const hasCustomIcon = Boolean(customIcons);

  const customConfig =
    workspace?.spaceStyling?.customConfig?.views?.[customConfigView]?.results
      ?.listItem;
  const showDescription = customConfig?.showDescription ?? true;
  const showPill = customConfig?.showPill ?? true;
  const showOpenInFullView = customConfig?.showOpenInFullView ?? true;
  const showPageAsPill = customConfig?.showPageAsPill ?? false;

  const isChunk = item?.metadata?.["chunkType"] === "CHUNK";
  const isLink = blobType === "LINK";
  const hasRecognizedType =
    Boolean(blobType && constants.MIMETYPE_TO_EXTENSION?.[blobType]) ||
    Boolean(inferredBlobType);
  const isFile = hasRecognizedType && !isLink;
  const isPdf =
    iconType === constants.MIMETYPE_APPLICATION_PDF ||
    blobType === constants.MIMETYPE_APPLICATION_PDF ||
    /\.pdf$/i.test(resolvedFileName);

  const sourceUrl = item?.metadata?.["sourceUrl"];
  const hasSourceUrl = Boolean(sourceUrl);
  const isDownloadable =
    constants.DOWNLOADABLE_BLOB_TYPES.includes(blobType) ||
    (isChunk && blobType !== "LINK");
  const hasToShowOpenInFullView = isPdf || blobType === "LINK" || hasSourceUrl;

  const title =
    item?.metadata?.["title"] ??
    item?.metadata?.["text"] ??
    item?.metadata?.["filename"] ??
    item?.metadata?.["elasticSearch.title.raw"] ??
    "";
  const description =
    item?.["description"] ??
    item?.metadata?.["elasticSearch.meta_description.raw"] ??
    "";
  const sourceName =
    item?.metadata?.["filename"] ??
    item?.metadata?.["elasticSearch.url.raw"] ??
    item?.metadata?.["link"] ??
    item?.metadata?.["source"] ??
    uploadFileMeta?.["filename"];
  const page = item?.metadata?.["loc.pageNumber"];

  const downloadFile = () =>
    apiClient.knowledge.downloadFile(
      item?.metadata?.["knowledgeId"] ?? item?.id,
    );

  const handleDownload = async (e?: { stopPropagation?: () => void }) => {
    e?.stopPropagation?.();
    const responseDownload = await downloadFile();
    if (!responseDownload?.url) return;
    const url = responseDownload.url;
    let downloadValue = "download.pdf";
    try {
      downloadValue =
        new URL(url).searchParams.get("download") || downloadValue;
    } catch {
      // Keep the default file name when the URL cannot be parsed.
    }
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = downloadValue;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  const handleOpenInFullView = (e?: { stopPropagation?: () => void }) => {
    e?.stopPropagation?.();

    if (hasSourceUrl && !isPdf) {
      const newWindow = window.open("about:blank", "_blank");
      if (newWindow) newWindow.location.href = sourceUrl;
      return;
    }

    if (item?.metadata?.["type"] === "LINK") {
      // Open the popup immediately to avoid being blocked.
      const newWindow = window.open("about:blank", "_blank");
      if (newWindow)
        newWindow.location.href =
          item?.["content"] ||
          item?.metadata?.["content"] ||
          item?.metadata?.["link"] ||
          "";
      return;
    }

    // Continue asynchronously.
    downloadFile().then((responseDownload) => {
      if (!responseDownload?.url) return;
      const rawUrl = responseDownload.url;
      // Remove the `download` param so the file is served inline (preview)
      // instead of as an attachment, and detect PDFs from the URL path as a
      // fallback when blobType metadata is missing.
      let previewUrl = rawUrl;
      let urlIsPdf = false;
      try {
        const parsedUrl = new URL(rawUrl);
        parsedUrl.searchParams.delete("download");
        previewUrl = parsedUrl.toString();
        urlIsPdf = /\.pdf$/i.test(parsedUrl.pathname);
      } catch {
        previewUrl = rawUrl.replace(regex.GET_DOWNLOAD_WORD, "");
      }

      if (isPdf || urlIsPdf) {
        // Trigger PDF preview modal via custom event.
        customEvents.publish(constants.CUSTOM_EVENTS.OPEN_PDF_PREVIEW, {
          url: previewUrl,
          fileName: sourceName || title || "Document",
          pageNumber: page || 1,
        });
      } else {
        // For non-PDF files, open in a new window.
        const newWindow = window.open("about:blank", "_blank");
        if (newWindow) newWindow.location.href = previewUrl;
      }
    });
  };

  const handleContainerClick = (e?: { stopPropagation?: () => void }) => {
    apiClient.spaces.sendEvent(currentInformation.spaceId, analyticsEvent, {
      term: title,
      resultId: item.id,
      resultTitle: title,
      blobType,
      description,
      isChunk,
      sourceName,
      page,
    });
    if (hasToShowOpenInFullView) {
      handleOpenInFullView(e);
      return;
    }
    handleDownload(e);
  };

  return {
    blobType,
    iconType,
    iconExtension,
    isChunk,
    isLink,
    isFile,
    isPdf,
    isDownloadable,
    hasSourceUrl,
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
  };
};
