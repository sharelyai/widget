import { useState } from "react";

import { SourcesModalContent, Wrapper, ModalWrapper } from "./styles";
import {
  ScrollBar,
  Language,
  PictureAsPdf,
  Lightbulb,
  ArrowDown,
  Close,
  Description,
  Word,
  Excel,
  Divider,
  Portal,
  Tooltip,
} from "@sharelyai/widget-ui-shared";
import { classNames, regex } from "@sharelyai/widget-services";

export const SourcesWithModal = ({ sources, message }) => {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [sourceToggled, setSourceToggled] = useState({});

  const getMatchedSources = [...message.matchAll(regex.GET_SORUCE_ID_MATCH)];
  const sourceFiltered = new Set([]);
  sources.forEach((source) => {
    const sourceId = source?.metadata?.source;
    if (getMatchedSources.some((match) => match[1] === sourceId)) {
      sourceFiltered.add(source);
    }
  });

  const handleToggleModal = () => {
    setIsOpenModal((prev) => !prev);
  };

  const handleToggleSource = (source) => {
    setSourceToggled((prev) => ({
      ...prev,
      [source.id]: !prev[source.id],
    }));
  };

  if (sourceFiltered?.size === 0) {
    return null;
  }

  return (
    <Wrapper>
      <button
        className="chat-content-conversation-sources"
        onClick={handleToggleModal}
      >
        <Lightbulb />
        {sourceFiltered?.size} Source{sourceFiltered?.size > 1 ? "s" : ""}
      </button>
      {isOpenModal && (
        <Portal>
          <ModalWrapper>
            <div className="background"></div>
            <div className="content">
              <SourcesModalContent>
                <div className="sources-modal-header">
                  <div className="source-modal-title">
                    <span className="title">Sources</span>
                    <span className="description">
                      {sourceFiltered.size} source
                      {sourceFiltered.size > 1 ? "s" : ""}
                      <Divider type="dot" />
                    </span>
                  </div>
                  <div className="source-modal-close">
                    <Tooltip text="Close" position="bottom">
                      <button
                        className="source-modal-close-button"
                        onClick={handleToggleModal}
                        aria-label="Close sources modal"
                        title="Close sources modal"
                      >
                        <Close />
                      </button>
                    </Tooltip>
                  </div>
                </div>
                <div className="sources-modal-content">
                  <ScrollBar options={{ suppressScrollX: true }}>
                    {sourceFiltered?.size === 0 && (
                      <p className="no-sources">
                        No sources found for this message.
                      </p>
                    )}
                    {sourceFiltered.size > 0 && (
                      <div className="sources-modal-list">
                        {[...sourceFiltered].map((source, index) => {
                          const title =
                            source?.metadata?.["pdf.info.Title"] ||
                            source?.metadata?.source?.split(":")?.[1] ||
                            "Unknown Source";
                          const pageNumber =
                            source?.metadata?.["loc.pageNumber"];
                          const relevancePercentage = (
                            source?.score * 100
                          ).toFixed(3);
                          const sourceBlobType = source?.metadata?.["blobType"];
                          // map blob type with text to icon
                          const sourceIcons = {
                            "application/pdf": PictureAsPdf,
                            "text/plain": Description,
                            "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                              Word,
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                              Excel,
                            "application/vnd.ms-excel": Excel,
                            "application/vnd.ms-word": Word,
                            https: Language,
                            generic: Language,
                          };

                          const SourceIcon =
                            sourceIcons?.[sourceBlobType || "generic"] ||
                            Language;
                          const contentPreview =
                            source?.metadata?.text || "No preview available";

                          return (
                            <div
                              key={`${source?.id}_${index}`}
                              className="source-item"
                              onClick={() => handleToggleSource(source)}
                            >
                              <div className="source-item-content">
                                <span className="source-icon">
                                  <SourceIcon />
                                </span>
                                <div className="source-description">
                                  <span className="source-title">{title}</span>
                                  <div className="source-detail">
                                    {pageNumber && (
                                      <>
                                        Page {pageNumber}
                                        <Divider type="dot" />
                                      </>
                                    )}
                                    {relevancePercentage + "% Relevance"}
                                  </div>
                                </div>
                                <span
                                  className={classNames("source-toggle", {
                                    opened: sourceToggled[source.id],
                                  })}
                                >
                                  <Tooltip text="Close" position="bottom">
                                    <button
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        handleToggleSource(source);
                                      }}
                                      className="source-toggle-button"
                                      aria-label="Toggle source details"
                                      title="Toggle source details"
                                    >
                                      <ArrowDown />
                                    </button>
                                  </Tooltip>
                                </span>
                              </div>
                              {sourceToggled[source.id] && (
                                <div className="source-item-collapse">
                                  <span className="source-item-collapse-title">
                                    Content preview
                                  </span>
                                  <span className="source-item-collapse-text">
                                    {contentPreview}
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </ScrollBar>
                </div>
              </SourcesModalContent>
            </div>
          </ModalWrapper>
        </Portal>
      )}
    </Wrapper>
  );
};
