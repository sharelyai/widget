import { constants } from "@sharelyai/widget-services";

import {
  Archive,
  AudioFile,
  Description,
  Excel,
  Language,
  PictureAsPdf,
  VideoFile,
  Word,
  Image,
  Link,
} from "../../icons";

// Maps a recognized blob type / mimetype to its icon component.
const MAP_BLOB_TYPE_TO_ICON: { [key: string]: React.ElementType } = {
  [constants.MIMETYPE_APPLICATION_PDF]: PictureAsPdf,
  [constants.MIMETYPE_TEXT]: Description,
  [constants.MIMETYPE_APPLICATION_VND_OPENXMLFORMATS_OFFICEDOCUMENT_WORDPROCESSINGML_DOCUMENT]:
    Word,
  [constants.MIMETYPE_APPLICATION_VND_OPENXMLFORMATS_OFFICEDOCUMENT_SPREADSHEETML_SHEET]:
    Excel,
  [constants.MIMETYPE_APPLICATION_VND_MS_EXCEL]: Excel,
  [constants.MIMETYPE_APPLICATION_MSWORD]: Word,
  https: Language,
  [constants.MIMETYPE_APPLICATION_VND_OPENXMLFORMATS_OFFICEDOCUMENT_PRESENTATIONML_PRESENTATION]:
    Archive,
  [constants.MIMETYPE_APPLICATION_ZIP]: Archive,
  [constants.MIMETYPE_APPLICATION_RAR]: Archive,
  [constants.MIMETYPE_AUDIO_MP3]: AudioFile,
  [constants.MIMETYPE_VIDEO_MP4]: VideoFile,
  [constants.MIMETYPE_IMAGE_PNG]: Image,
  [constants.MIMETYPE_IMAGE_JPEG]: Image,
  [constants.MIMETYPE_IMAGE_GIF]: Image,
  [constants.MIMETYPE_IMAGE_WEBP]: Image,
};

const MAP_BLOB_TYPE_TO_ICON_FILES: { [key: string]: React.ElementType } = {
  LINK: Link,
};

export interface ResourceIconProps {
  /** Resolved mimetype/blob type for the resource (see useResourceListItem). */
  iconType: string;
  /** Whether the resource is a content chunk (uses the "star" custom icon). */
  isChunk?: boolean;
  /** Workspace custom icons keyed by file extension / "star" / "default". */
  customIcons?: { [key: string]: string } | null;
}

/**
 * Renders the icon for a resource list item, shared by the search and browse
 * views. Prefers a workspace custom icon (chunk → "star", then by extension,
 * then "default") and otherwise falls back to a built-in icon by blob type.
 */
export const ResourceIcon = ({
  iconType,
  isChunk = false,
  customIcons,
}: ResourceIconProps) => {
  const iconExtension = constants.MIMETYPE_TO_EXTENSION?.[iconType];
  const customIconSvg =
    (isChunk ? customIcons?.["star"] : undefined) ||
    (iconExtension ? customIcons?.[iconExtension] : undefined) ||
    customIcons?.["default"];

  if (customIconSvg) {
    // Convert the stored SVG string into a rendered icon.
    return (
      <span
        dangerouslySetInnerHTML={{ __html: customIconSvg }}
        style={{ display: "inline-flex", alignItems: "center" }}
      />
    );
  }

  const Icon =
    MAP_BLOB_TYPE_TO_ICON[iconType] ||
    MAP_BLOB_TYPE_TO_ICON_FILES[iconType] ||
    Description;
  return <Icon />;
};
