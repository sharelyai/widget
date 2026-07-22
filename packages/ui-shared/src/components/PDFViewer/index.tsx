import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { Modal } from "../Modal"; // Fixed casing
import { PDFPreviewWrapper } from "./styles";
import { Close, Download } from "../../icons";
import { FC, useState } from "react";

interface PDFPreviewProps {
  url: string;
  open: boolean;
  onClose: () => void;
  fileName?: string;
  initialPage?: number;
}

export const PDFPreview: FC<PDFPreviewProps> = (props) => {
  const { url, open, onClose, fileName, initialPage = 1 } = props;

  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);

  const minimumPages = numPages !== null && numPages <= 5; // Added null check

  const handleDownload = async () => {
    if (!url) return;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName || "document.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Failed to download PDF:", err);
    }
  };

  if (!open) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      customWidth="90%"
      customHeight="90%"
      customMaxHeight="90%"
      customMaxWidth="90%"
      modalContainerProps={{ padding: "0" }}
      isFullScreen={true}
    >
      <PDFPreviewWrapper>
        <div className="pdf-header">
          <div className="pdf-controls">
            <div className="pdf-title">{fileName || "PDF Preview"}</div>
            {numPages !== null && numPages > 1 && ( // Added null check
              <div className="pdf-navigation-header">
                <span>
                  {pageNumber} / {numPages}
                </span>
              </div>
            )}
            <div className="action-buttons">
              <button className="control-button" onClick={handleDownload}>
                <Download />
              </button>
              <button className="control-button" onClick={onClose}>
                <Close />
              </button>
            </div>
          </div>
        </div>
        <div
          className="pdf-container"
          style={{ overflowY: "auto", maxHeight: "calc(100vh - 60px)" }}
        >
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
            <Viewer
              fileUrl={url}
              initialPage={minimumPages ? 0 : initialPage - 1}
              theme="light"
              onDocumentLoad={(event) => {
                setNumPages(event?.doc?.numPages);
              }}
              onPageChange={(event) => {
                setPageNumber(event?.currentPage + 1);
              }}
              setRenderRange={({ startPage, endPage }) => {
                if (minimumPages || endPage === 1) {
                  return { startPage, endPage };
                }

                const current = pageNumber;
                const total = numPages === null ? 1 : numPages; // Added null check
                const prev = Math.max(0, current - 2);
                const next = Math.min(total, current + 2);
                return { startPage: prev, endPage: next };
              }}
            />
          </Worker>
        </div>
      </PDFPreviewWrapper>
    </Modal>
  );
};