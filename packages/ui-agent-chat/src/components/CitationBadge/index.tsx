import { useState, useRef, useCallback, useMemo } from "react";
import { useFloating, offset, flip, shift } from "@floating-ui/react";
import type { Source } from "@sharelyai/widget-services";
import {
  useSourceDownload,
  resolveSourceUrl,
  getSourcePageNumber,
  getSourceFileLabel,
  isPdfSource,
} from "@sharelyai/widget-services";
import {
  BadgeWrapper,
  HoverCard,
  HoverCardRow,
  HoverCardLabel,
  HoverCardValue,
  HoverCardHeader,
  HoverCardLink,
  TypeBadge,
  SimilarityScore,
  HoverCardOpenButton,
} from "./styles";
import {
  FileTextIcon,
  AtomIcon,
  TagIcon,
  UsersIcon,
  LinkIcon,
  ExternalLinkIcon,
  LoaderIcon,
  PdfIcon,
} from "../icons";

interface CitationBadgeProps {
  index: number;
  source: Source;
  onSourceClick?: (sourceId: string) => void;
}

function getExternalUrl(source: Source): string | undefined {
  return resolveSourceUrl(source);
}

function isDownloadableSource(source: Source): boolean {
  const sourceType = source.metadata?.sourceType?.toUpperCase();
  // STRING type sources are text-only, not downloadable files
  if (sourceType === "STRING") return false;
  // Sources that expose an external URL should be opened, not downloaded
  if (getExternalUrl(source)) return false;
  // Downloadable when we can identify a file (filename ext, title ext, or
  // blobType) and we have a knowledgeId to fetch it with.
  if (source.metadata?.knowledgeId && getSourceFileLabel(source)) return true;
  return false;
}

function getSourceTypeIcon(source: Source) {
  if (isPdfSource(source)) return <PdfIcon />;
  // URL-bearing sources (real http(s) URL but not a PDF) render as a link.
  if (resolveSourceUrl(source)) return <LinkIcon />;
  switch (source.type) {
    case "knowledge":
    case "document":
      return <FileTextIcon />;
    case "atom":
      return <AtomIcon />;
    case "taxonomy":
      return <TagIcon />;
    case "role":
      return <UsersIcon />;
    case "url":
      return <LinkIcon />;
    default:
      return <FileTextIcon />;
  }
}

export function CitationBadge({
  index,
  source,
  onSourceClick,
}: CitationBadgeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { downloadSource, isLoading } = useSourceDownload();

  const middleware = useMemo(
    () => [offset(8), flip(), shift({ padding: 8 })],
    [],
  );
  const { refs, floatingStyles } = useFloating({
    placement: "top",
    middleware,
  });

  const floatingRefs = useRef(refs);
  floatingRefs.current = refs;
  const safeSetReference = useCallback((node: HTMLElement | null) => {
    floatingRefs.current.setReference(node);
  }, []);
  const safeSetFloating = useCallback((node: HTMLElement | null) => {
    floatingRefs.current.setFloating(node);
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 150);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSourceClick?.(source.id);
  };

  const handleOpenDocument = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      downloadSource(source);
    },
    [downloadSource, source],
  );

  const similarity = source.metadata?.similarity;
  const similarityPercent =
    similarity !== undefined ? Math.round(similarity * 100) : null;

  return (
    <>
      <BadgeWrapper
        ref={safeSetReference}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        aria-label={`Source ${index}: ${source.title}`}
      >
        {index}
      </BadgeWrapper>
      {isHovered && (
        <HoverCard
          ref={safeSetFloating}
          style={floatingStyles}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <HoverCardHeader>
            <TypeBadge $type={source.type}>
              {getSourceTypeIcon(source)}
              {getSourceFileLabel(source) ||
                source.metadata?.sourceType ||
                source.type}
            </TypeBadge>
            {similarityPercent !== null && (
              <SimilarityScore>{similarityPercent}% match</SimilarityScore>
            )}
          </HoverCardHeader>

          <HoverCardRow>
            <HoverCardLabel>Title</HoverCardLabel>
            <HoverCardValue>{source.title}</HoverCardValue>
          </HoverCardRow>

          {source.metadata?.filename && getSourceFileLabel(source) && (
            <HoverCardRow>
              <HoverCardLabel>File</HoverCardLabel>
              <HoverCardValue>{source.metadata.filename}</HoverCardValue>
            </HoverCardRow>
          )}

          {(() => {
            const pageNumber = getSourcePageNumber(source);
            return pageNumber && pageNumber > 0 ? (
              <HoverCardRow>
                <HoverCardLabel>Page</HoverCardLabel>
                <HoverCardValue>{pageNumber}</HoverCardValue>
              </HoverCardRow>
            ) : null;
          })()}

          {(source.snippet || source.excerpt) && (
            <HoverCardRow>
              <HoverCardLabel>Preview</HoverCardLabel>
              <HoverCardValue>
                {(source.snippet || source.excerpt || "")
                  .replace(/<[^>]*>/g, "")
                  .replace(/<[^>]*$/, "")
                  .replace(/&amp;/g, "&")
                  .replace(/&lt;/g, "<")
                  .replace(/&gt;/g, ">")
                  .replace(/&quot;/g, '"')
                  .replace(/&#039;/g, "'")
                  .trim()}
              </HoverCardValue>
            </HoverCardRow>
          )}

          {getExternalUrl(source) && (
            <HoverCardLink
              href={getExternalUrl(source)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              {getExternalUrl(source)}
            </HoverCardLink>
          )}

          {source.metadata?.knowledgeId && isDownloadableSource(source) && (
            <HoverCardOpenButton
              onClick={handleOpenDocument}
              disabled={isLoading}
            >
              {isLoading ? <LoaderIcon /> : <ExternalLinkIcon />}
              {isLoading ? "Opening..." : "Open Document"}
            </HoverCardOpenButton>
          )}
        </HoverCard>
      )}
    </>
  );
}
