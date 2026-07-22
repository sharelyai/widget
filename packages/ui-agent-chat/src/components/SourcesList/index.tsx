import { useState, useRef, useCallback, useMemo } from "react";
import { useFloating, offset, flip, shift } from "@floating-ui/react";
import type { Source } from "@sharelyai/widget-services";
import {
  useSourceDownload,
  resolveSourceUrl,
  getSourcePageNumber,
  getSourceFileLabel,
  isPdfSource,
  isPreviewOnlySource,
} from "@sharelyai/widget-services";
import { SourcePreviewModal } from "../SourcePreviewModal";
import {
  SourcesSection,
  SourcesSectionLabel,
  SourceChipsRow,
  SourceChipButton,
  SourceChipTitle,
  SourceChipRelevance,
  SourceMoreChip,
} from "../styles";
import {
  HoverCard,
  HoverCardRow,
  HoverCardLabel,
  HoverCardValue,
  HoverCardHeader,
  HoverCardLink,
  TypeBadge,
  SimilarityScore,
  HoverCardOpenButton,
} from "../CitationBadge/styles";
import {
  LinkIcon,
  FileTextIcon,
  AtomIcon,
  TagIcon,
  UsersIcon,
  ExternalLinkIcon,
  LoaderIcon,
  PdfIcon,
} from "../icons";

const MAX_VISIBLE = 5;

function truncateTitle(title: string, maxLength = 30): string {
  if (title.length <= maxLength) return title;
  return title.slice(0, maxLength) + "...";
}

function getExternalUrl(source: Source): string | undefined {
  return resolveSourceUrl(source);
}

function isDownloadableSource(source: Source): boolean {
  const sourceType = source.metadata?.sourceType?.toUpperCase();
  if (sourceType === "STRING") return false;
  if (getExternalUrl(source)) return false;
  if (source.metadata?.knowledgeId && getSourceFileLabel(source)) return true;
  return false;
}

function getSourceTypeIcon(source: Source) {
  if (isPdfSource(source)) return <PdfIcon />;
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

interface SourceChipWithHoverProps {
  source: Source;
  onClick: (source: Source) => void;
}

function SourceChipWithHover({ source, onClick }: SourceChipWithHoverProps) {
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
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsHovered(false), 150);
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
  const pct = similarity !== undefined ? Math.round(similarity * 100) : null;

  return (
    <>
      <SourceChipButton
        ref={safeSetReference}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => onClick(source)}
        aria-label={`${source.title}${
          pct !== null ? `, ${pct}% relevant` : ""
        }`}
      >
        {isPdfSource(source) ? (
          <PdfIcon size={18} />
        ) : resolveSourceUrl(source) ? (
          <LinkIcon size={18} />
        ) : (
          <FileTextIcon size={18} />
        )}
        <SourceChipTitle>
          {truncateTitle(source.title)}
          {(() => {
            const pageNumber = getSourcePageNumber(source);
            return pageNumber && pageNumber > 0 ? (
              <span style={{ color: "#667085", fontWeight: 400 }}>
                {" "}
                — p. {pageNumber}
              </span>
            ) : null;
          })()}
        </SourceChipTitle>
        {pct !== null && <SourceChipRelevance>{pct}%</SourceChipRelevance>}
      </SourceChipButton>
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
            {pct !== null && <SimilarityScore>{pct}% match</SimilarityScore>}
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

interface SourcesListProps {
  sources: Source[];
  onSourceClick?: (source: Source) => void;
  onShowAllSources?: (sources: Source[]) => void;
  /** @deprecated No longer used in new design */
  defaultCollapsed?: boolean;
  /** @deprecated No longer used in new design */
  highlightedSourceId?: string | null;
}

export function SourcesList({
  sources,
  onSourceClick,
  onShowAllSources,
}: SourcesListProps) {
  const { downloadSource } = useSourceDownload();
  const [previewSource, setPreviewSource] = useState<Source | null>(null);

  if (sources.length === 0) return null;

  const sorted = [...sources].sort((a, b) => {
    const aScore = a.metadata?.similarity ?? 0;
    const bScore = b.metadata?.similarity ?? 0;
    return bScore - aScore;
  });
  const visible = sorted.slice(0, MAX_VISIBLE);
  const remaining = sorted.length - MAX_VISIBLE;

  const handleClick = (source: Source) => {
    // Preview-only sources have no URL and no downloadable file. Calling the
    // download endpoint would error, so render an inline detail dialog.
    if (isPreviewOnlySource(source)) {
      setPreviewSource(source);
      return;
    }
    if (onSourceClick) {
      onSourceClick(source);
    } else {
      downloadSource(source);
    }
  };

  return (
    <SourcesSection>
      <SourcesSectionLabel>
        <LinkIcon size={18} />
        Sources
        <span style={{ opacity: 0.7 }}>({sources.length})</span>
      </SourcesSectionLabel>
      <SourceChipsRow>
        {visible.map((source) => (
          <SourceChipWithHover
            key={source.id}
            source={source}
            onClick={handleClick}
          />
        ))}
        {remaining > 0 && (
          <SourceMoreChip onClick={() => onShowAllSources?.(sources)}>
            +{remaining} more
          </SourceMoreChip>
        )}
      </SourceChipsRow>
      <SourcePreviewModal
        open={previewSource !== null}
        source={previewSource}
        onClose={() => setPreviewSource(null)}
      />
    </SourcesSection>
  );
}
