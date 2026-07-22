const EMAIL =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
const MARKDOWN_ANCHOR_GENERAL_ALL =
  /\[source\]\(((?:[^()\\]|\\.)*(?:\((?:[^()\\]|\\.)*\)(?:[^()\\]|\\.)*)*)\)/gim;
const MARKDOWN_ANCHOR_GENERAL = /\[([^\]]+)\]\(([^)]+)\)/gim;
const MARKDOWN_ANCHOR = /\[([^\]]+)\]/gim;
const MARKDOWN_ANCHOR_WRONG = /\[source\](?!\()/gim;
const CHECK_URL = /^(http|https):\/\/[^ "]+$/;
const PAGE_NUMBER_DOCUMENT_DOWNLOAD =
  /^(\d+):([^:]*)(?::([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}))?$/;
const CHECK_TEMPORAL_USER = /You|Anonymous/;
const GET_COMMUNITY_IDS_MATCH = /\[communityMember]\((.*?)\)/gm;
const GET_COMMUNITY_ID_MATCH = /\[communityMember]\((.*?)\)/;
const GET_SORUCE_ID_MATCH = /\[source]\((.*?)\)/gim;
const GET_SOURCE_WITHOUT_MARKDOWN = /(?<=\[source]\()(.*?)(?=\))/;
const GET_DOWNLOAD_WORD = /download=/;
const GET_PAGE_WORD = /page=.*/;
const GET_SAVE_TAGS = /<save>(.*?)<\/save>/gim;
const GET_SAVE_CONTENT = /(?<=<save>)(.*?)(?=<\/save>)/gim;
const API_LOADING_MESSAGE = /!API!/gim;
const SHARELYAI_TAGS = /<\/?sharelyai_(start|end)>/gim;
const SHARELYAI_TAGS_CONTENT =
  /<sharelyai_start>((?:.|\n)*?)<\/sharelyai_end>/gim;
const AI_TOOL_MARKER = /AI_TOOL_MARKER/gim;
const MATCH_TOKEN_PARAMS_MESSAGE = /\[.*?\]\n/;

export const regex = {
  MARKDOWN_ANCHOR,
  MARKDOWN_ANCHOR_GENERAL_ALL,
  EMAIL,
  CHECK_URL,
  MARKDOWN_ANCHOR_GENERAL,
  MARKDOWN_ANCHOR_WRONG,
  PAGE_NUMBER_DOCUMENT_DOWNLOAD,
  CHECK_TEMPORAL_USER,
  GET_COMMUNITY_IDS_MATCH,
  GET_COMMUNITY_ID_MATCH,
  GET_SORUCE_ID_MATCH,
  GET_SOURCE_WITHOUT_MARKDOWN,
  GET_DOWNLOAD_WORD,
  GET_PAGE_WORD,
  GET_SAVE_TAGS,
  GET_SAVE_CONTENT,
  API_LOADING_MESSAGE,
  SHARELYAI_TAGS,
  SHARELYAI_TAGS_CONTENT,
  AI_TOOL_MARKER,
  MATCH_TOKEN_PARAMS_MESSAGE,
};
