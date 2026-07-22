import { createPortal } from "react-dom";
import { useGlobalStore } from "@sharelyai/widget-services";
import { IconButton } from "../IconButton";
import { CloseIcon } from "../icons";
import { Overlay, Container, Header, InfoList, InfoRow } from "./styles";

export interface VersionInfo {
  chatType?: string;
  agentId?: string;
  uiLanguage?: string;
  knowledgeLanguage?: string;
}

interface AboutModalProps {
  open: boolean;
  onClose: () => void;
  version?: string;
  versionInfo?: VersionInfo;
}

export function AboutModal({
  open,
  onClose,
  version,
  versionInfo,
}: AboutModalProps) {
  const config = useGlobalStore((s) => s.config);
  const uiLanguage = versionInfo?.uiLanguage || config?.lang;
  const knowledgeLanguage =
    versionInfo?.knowledgeLanguage || config?.langKnowledge;

  if (!open || typeof document === "undefined") return null;

  const rows = [
    { label: "Web Control Version", value: version || "unknown" },
    { label: "Chat", value: versionInfo?.chatType || "Agent" },
    { label: "Agent ID", value: versionInfo?.agentId || "Default" },
    { label: "UI Language", value: uiLanguage || "—" },
    { label: "Knowledge Language", value: knowledgeLanguage || "—" },
  ];

  return createPortal(
    <Overlay onClick={onClose}>
      <Container onClick={(e) => e.stopPropagation()}>
        <Header>
          <span className="about-title">Web Control Info</span>
          <IconButton
            icon={<CloseIcon size={20} />}
            ariaLabel="Close"
            onClick={onClose}
          />
        </Header>
        <InfoList>
          {rows.map((row) => (
            <InfoRow key={row.label}>
              <span className="about-label">{row.label}</span>
              <span className="about-value">{row.value}</span>
            </InfoRow>
          ))}
        </InfoList>
      </Container>
    </Overlay>,
    document.body,
  );
}
