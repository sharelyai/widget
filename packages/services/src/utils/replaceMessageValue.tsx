import { regex } from "./regex";
import { constants } from "../constants";
import { tryParseJSON } from "./tryParseJson";

export interface IReplaceMessageValueProps {
  message: string;
}

export const replaceMessageValue = (props: IReplaceMessageValueProps) => {
  const { message } = props;
  const originalMessage = message;

  // Clean the message first
  let cleanMessage = message
    ?.replace("::0", "")
    ?.replace("::1", "")
    ?.replace(regex.AI_TOOL_MARKER, "")
    ?.replace(regex.GET_COMMUNITY_IDS_MATCH, "")
    ?.replace(regex.GET_SAVE_TAGS, "")
    ?.replace(regex.API_LOADING_MESSAGE, "")
    ?.replace(regex.SHARELYAI_TAGS, "")
    ?.replace(regex.SHARELYAI_TAGS_CONTENT, "")
    ?.replace(regex.MARKDOWN_ANCHOR_WRONG, "");

  // Function to handle all anchor types in the cleaned message
  function formatAllAnchors(text: string) {
    // Type 1: [label](href)
    text = text.replace(
      regex.MARKDOWN_ANCHOR_GENERAL,
      function (_m, label, href) {
        return handleAnchorsValidations(label, href);
      },
    );
    // Type 2 & 3: [label] (but not if followed by '(' which would be a markdown anchor)
    text = text.replace(/\^\[([^\]]+)\](?!e)/g, (_, label) => {
      return handleAnchorsValidations(label);
    });
    return text;
  }

  // Handles all anchor types robustly and user-friendly
  function handleAnchorsValidations(label: string, href?: string) {
    // First check if href has the document anchor format, regardless of label
    if (href) {
      const anchorValues = href?.split(":");
      if (anchorValues.length === 3 && /^\d+$/.test(anchorValues[0])) {
        // Handle [anylabel](13:(anonymous):uuid) format
        const link = `${constants.PAGE_NUMBER_DOCUMENT_DOWNLOAD_URL}${href
          ?.split(" ")
          ?.join("____")}`;
        const pageNum = parseInt(anchorValues[0], 10);
        const title = anchorValues[1].replaceAll("____", " ");
        const text = pageNum > 0 ? `${title} P${anchorValues[0]}` : title;
        return `[${text}](${link})`;
      }

      // Support [anylabel](filename.pdf:uuid) format
      if (anchorValues.length === 2) {
        // Check if this is actually a URL (e.g., "http:example.com") rather than a document
        const isUrl = /^https?:$/.test(anchorValues[0].toLowerCase());
        if (!isUrl) {
          const link = `${constants.PAGE_NUMBER_DOCUMENT_DOWNLOAD_URL}${href
            ?.split(" ")
            ?.join("____")}`;
          const text = anchorValues[1].replaceAll("____", " ");
          return `[${text}](${link})`;
        }
      }

      // For URLs, return markdown link
      if (/^https?:\/\//.test(href)) {
        return `[${label}](${href})`;
      }

      // fallback for regular links
      return `[${label}](${href?.split(" ")?.join("____")})`;
    }
    // Type 2: [28:filename.pdf:uuid]
    if (!href && label) {
      const anchorValues = label?.split(":");
      if (anchorValues.length === 3 && /^\d+$/.test(anchorValues[0])) {
        const pageNum = parseInt(anchorValues[0], 10);
        const displayText =
          pageNum > 0
            ? `${anchorValues[1]} P${anchorValues[0]}`
            : anchorValues[1];
        return `[${displayText}](${
          constants.PAGE_NUMBER_DOCUMENT_DOWNLOAD_URL
        }${label?.split(" ")?.join("____")})`;
      }
      // Type 3: [https://link]
      if (/^https?:\/\//.test(label)) {
        return `[${label}](${label})`;
      }
      return label;
    }
    // General [label](href) case
    if (href) {
      if (/^https?:\/\//.test(href)) {
        return `[${label}](${href})`;
      }
      return `[${label}](${href?.split(" ").join("____")})`;
    }
    return label;
  }

  // Now format all anchors in the cleaned message
  cleanMessage = formatAllAnchors(cleanMessage);

  // check if the original message has sharely tags
  let content;
  const checkJson = tryParseJSON(cleanMessage);
  if (checkJson) {
    content = checkJson;
  }
  const hasSharelyTags = regex.SHARELYAI_TAGS.test(originalMessage);
  if (hasSharelyTags && !checkJson) {
    const sharelyTagsContent =
      regex.SHARELYAI_TAGS_CONTENT.exec(originalMessage)?.[1] || "";

    // check if has base64 encode
    const isBase64 = sharelyTagsContent.match(/^[a-zA-Z0-9+/]+={0,2}$/);
    if (isBase64) {
      const decoded = Buffer.from(sharelyTagsContent, "base64").toString(
        "utf-8",
      );
      content = tryParseJSON(decoded);
    } else {
      const checkJson = tryParseJSON(sharelyTagsContent);
      content = checkJson;
    }
  }

  if (content) {
    const hasError =
      content?.result?.api_response?.message || content?.api_response?.message;

    if (hasError) {
      return `>\n ${hasError}`;
    }

    const result = content?.result?.reslut || content?.result;
    const isArray = Array.isArray(result);

    if (isArray) {
      return ">\n " + result?.[0]?.markdown;
    } else {
      return ">\n " + result?.markdown;
    }
  }

  return cleanMessage;
};
