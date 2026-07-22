import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Source } from "@sharelyai/widget-services";
import {
  getSourcePageNumber,
  getSourceFileLabel,
  resolveSourceUrl,
  isPdfSource,
} from "@sharelyai/widget-services";
import {
  ModalBackdrop,
  ModalContainer,
  ModalHeader,
  ModalTitle,
  ModalBody,
} from "../styles";
import { IconButton } from "../IconButton";
import {
  CloseIcon,
  FileTextIcon,
  PdfIcon,
  LinkIcon,
  ExternalLinkIcon,
} from "../icons";

interface SourcePreviewModalProps {
  open: boolean;
  source: Source | null;
  onClose: () => void;
}

function getIcon(source: Source) {
  if (isPdfSource(source)) return <PdfIcon size={20} />;
  if (resolveSourceUrl(source)) return <LinkIcon size={20} />;
  return <FileTextIcon size={20} />;
}

function cleanText(value: string | undefined): string {
  if (!value) return "";
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/<[^>]*$/, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .trim();
}

export function SourcePreviewModal({
  open,
  source,
  onClose,
}: SourcePreviewModalProps) {
  // Render via React portal to document.body so the modal escapes any ancestor
  // that creates a stacking context (transform / filter / overflow:hidden) —
  // chat bubbles and parent ModalBackdrop both create one, which would
  // otherwise hide a position:fixed element.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!open || !source || !mounted || typeof document === "undefined") {
    return null;
  }

  const fileLabel = getSourceFileLabel(source);
  const pageNumber = getSourcePageNumber(source);
  const externalUrl = resolveSourceUrl(source);
  const similarity = source.metadata?.similarity;
  const similarityPct =
    similarity !== undefined ? Math.round(similarity * 100) : null;
  const preview = cleanText(source.snippet || source.excerpt);

  return createPortal(
    // Sits above the parent AllSourcesModal (z-index 1000) so a click from
    // the all-sources list opens this dialog visibly on top.
    <ModalBackdrop onClick={onClose} style={{ zIndex: 1100 }}>
      <ModalContainer
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 480 }}
      >
        <ModalHeader>
          <ModalTitle style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {getIcon(source)}
            <span>Source details</span>
          </ModalTitle>
          <IconButton
            icon={<CloseIcon size={20} />}
            ariaLabel="Close"
            onClick={onClose}
          />
        </ModalHeader>
        <ModalBody>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Row label="Title" value={source.title} />
            <Row
              label="Type"
              value={
                fileLabel || source.metadata?.sourceType || source.type || "—"
              }
            />
            {pageNumber && pageNumber > 0 ? (
              <Row label="Page" value={String(pageNumber)} />
            ) : null}
            {similarityPct !== null && (
              <Row label="Relevance" value={`${similarityPct}% match`} />
            )}
            {preview && <Row label="Preview" value={preview} multiline />}
            {externalUrl && (
              <a
                href={externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 13,
                  color: "#2563EB",
                  textDecoration: "none",
                  wordBreak: "break-all",
                }}
              >
                <ExternalLinkIcon size={14} />
                {externalUrl}
              </a>
            )}
          </div>
        </ModalBody>
      </ModalContainer>
    </ModalBackdrop>,
    document.body,
  );
}

function Row({
  label,
  value,
  multiline,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "#667085",
          textTransform: "uppercase",
          letterSpacing: 0.4,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 14,
          color: "#101828",
          lineHeight: 1.5,
          whiteSpace: multiline ? "pre-wrap" : "normal",
          wordBreak: "break-word",
        }}
      >
        {value}
      </span>
    </div>
  );
}
