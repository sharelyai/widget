import { useEffect, useState } from "react";
import { constants, customEvents } from "@sharelyai/widget-services";

export interface PdfPreviewState {
  open: boolean;
  url: string;
  fileName: string;
  pageNumber: number;
}

/**
 * Owns the PDF preview modal state and wires it to the global OPEN/CLOSE PDF
 * custom events. Extracted from WebControl for readability — behavior unchanged.
 */
export const usePdfPreview = () => {
  const [pdfPreview, setPdfPreview] = useState<PdfPreviewState>({
    open: false,
    url: "",
    fileName: "",
    pageNumber: 1,
  });

  useEffect(() => {
    const handleOpenPdf = (event: any) => {
      const { url, fileName, pageNumber } = event.detail;
      setPdfPreview({
        open: true,
        url,
        fileName: fileName || "Document",
        pageNumber: pageNumber || 1,
      });
    };
    const handleClosePdf = () =>
      setPdfPreview((prev) => ({ ...prev, open: false }));

    customEvents.subscribe(
      constants.CUSTOM_EVENTS.OPEN_PDF_PREVIEW,
      handleOpenPdf,
    );
    customEvents.subscribe(
      constants.CUSTOM_EVENTS.CLOSE_PDF_PREVIEW,
      handleClosePdf,
    );

    return () => {
      customEvents.unsubscribe(
        constants.CUSTOM_EVENTS.OPEN_PDF_PREVIEW,
        handleOpenPdf,
      );
      customEvents.unsubscribe(
        constants.CUSTOM_EVENTS.CLOSE_PDF_PREVIEW,
        handleClosePdf,
      );
    };
  }, []);

  const closePdfPreview = () =>
    setPdfPreview((prev) => ({ ...prev, open: false }));

  return { pdfPreview, closePdfPreview };
};
