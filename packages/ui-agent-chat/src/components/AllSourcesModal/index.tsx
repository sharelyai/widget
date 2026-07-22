import { useState } from "react";
import type { Source } from "@sharelyai/widget-services";
import {
  useSourceDownload,
  resolveSourceUrl,
  getSourcePageNumber,
  getSourceFileLabel,
  isPdfSource,
  isPreviewOnlySource,
} from "@sharelyai/widget-services";
import {
  ModalBackdrop,
  ModalContainer,
  ModalHeader,
  ModalTitle,
  ModalBody,
  SourceChipRelevance,
} from "../styles";
import { IconButton } from "../IconButton";
import { CloseIcon, FileTextIcon, PdfIcon, LinkIcon } from "../icons";
import { SourcePreviewModal } from "../SourcePreviewModal";

function getSourceIcon(source: Source) {
  if (isPdfSource(source)) return <PdfIcon size={18} />;
  // URL articles (a real http(s) URL but not a downloadable file) get the link
  // icon. PDFs are caught above so a PDF with a URL still renders as PDF.
  if (resolveSourceUrl(source)) return <LinkIcon size={18} />;
  return <FileTextIcon size={18} />;
}

interface AllSourcesModalProps {
  open: boolean;
  onClose: () => void;
  sources: Source[];
  onSourceClick?: (source: Source) => void;
}

export function AllSourcesModal({
  open,
  onClose,
  sources,
  onSourceClick,
}: AllSourcesModalProps) {
  const { downloadSource } = useSourceDownload();
  const [previewSource, setPreviewSource] = useState<Source | null>(null);

  if (!open) return null;

  const sorted = [...sources].sort((a, b) => {
    const aScore = a.metadata?.similarity ?? 0;
    const bScore = b.metadata?.similarity ?? 0;
    return bScore - aScore;
  });

  const handleSourceClick = (source: Source) => {
    // Preview-only sources have nothing to download or open externally —
    // surface the snippet in a small dialog over this modal instead.
    if (isPreviewOnlySource(source)) {
      setPreviewSource(source);
      return;
    }
    if (onSourceClick) {
      onSourceClick(source);
    } else {
      downloadSource(source);
    }
    onClose();
  };

  return (
    <ModalBackdrop onClick={onClose}>
      <ModalContainer
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 480 }}
      >
        <ModalHeader>
          <ModalTitle>All sources ({sources.length})</ModalTitle>
          <IconButton
            icon={<CloseIcon size={20} />}
            ariaLabel="Close"
            onClick={onClose}
          />
        </ModalHeader>
        <ModalBody>
          {sorted.map((source) => {
            const similarity = source.metadata?.similarity;
            const pct =
              similarity !== undefined ? Math.round(similarity * 100) : null;

            return (
              <button
                key={source.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "none",
                  background: "none",
                  width: "100%",
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: 14,
                  transition: "background 0.15s",
                }}
                onClick={() => handleSourceClick(source)}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#F2F4F7")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "none")
                }
              >
                {getSourceIcon(source)}
                <span
                  style={{
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    width: "70%",
                  }}
                >
                  {source.title}
                </span>
                {(() => {
                  const pageNumber = getSourcePageNumber(source);
                  return pageNumber && pageNumber > 0 ? (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: "#667085",
                        background: "#F2F4F7",
                        borderRadius: 4,
                        padding: "2px 6px",
                        flexShrink: 0,
                        textTransform: "uppercase",
                      }}
                    >
                      p. {pageNumber}
                    </span>
                  ) : null;
                })()}
                {getSourceFileLabel(source) && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: "#667085",
                      background: "#F2F4F7",
                      borderRadius: 4,
                      padding: "2px 6px",
                      flexShrink: 0,
                      textTransform: "uppercase",
                    }}
                  >
                    {getSourceFileLabel(source)}
                  </span>
                )}
                {pct !== null && (
                  <SourceChipRelevance>{pct}%</SourceChipRelevance>
                )}
              </button>
            );
          })}
        </ModalBody>
      </ModalContainer>
      <SourcePreviewModal
        open={previewSource !== null}
        source={previewSource}
        onClose={() => setPreviewSource(null)}
      />
    </ModalBackdrop>
  );
}
