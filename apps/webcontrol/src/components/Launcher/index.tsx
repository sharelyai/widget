import { Logo } from "@sharelyai/widget-ui-shared";

interface LauncherProps {
  workspace: any;
  isOpen: boolean;
  /** Text shown when collapsed; falls back to `defaultText`. */
  closedText?: string;
  defaultText: string;
  onToggle: () => void;
}

/**
 * The floating launcher button shown when the widget is collapsed (non-inline
 * modes). Extracted from WebControl — purely presentational, behavior unchanged.
 */
export const Launcher = ({
  workspace,
  isOpen,
  closedText,
  defaultText,
  onToggle,
}: LauncherProps) => (
  <div
    className="sharely-launcher sharelyai-webcontroller-small-chat"
    onClick={onToggle}
  >
    <div className="launcher-logo sharelyai-webcontroller-logo">
      {workspace?.photo ? <img src={workspace.photo} alt="AI" /> : <Logo />}
    </div>
    {!isOpen && (
      <p className="launcher-text sharelyai-webcontroller-text">
        {closedText || defaultText}
      </p>
    )}
  </div>
);
