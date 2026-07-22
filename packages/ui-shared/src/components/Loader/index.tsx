import { CardLoadingWrapper, LoaderWrapper, CircularLoader } from "./styles";
import { Logo } from "../../icons";

type typeOfLoading = "ai" | "card-loading" | "circular-loader";
interface IProps {
  text?: string;
  imageAi?: string;
  type?: typeOfLoading;
}

export const Loader = (props: IProps) => {
  const { text = "", imageAi, type = "ai" } = props;

  if (type === "circular-loader") {
    return <CircularLoader />;
  }

  if (type === "card-loading") {
    return (
      <CardLoadingWrapper className="sharelyai-webcontroller-loading-component-container">
        <div className="sharelyai-webcontroller-loading-component">
          <div className="sharelyai-webcontroller-loading-icon">
            <div className="sharelyai-webcontroller-circular-loader"></div>
          </div>
          {text && (
            <div className="sharelyai-webcontroller-loading-text">{text}</div>
          )}
        </div>
      </CardLoadingWrapper>
    );
  }

  return (
    <LoaderWrapper>
      <div className="sharelyai-webcontroller-logo">
        {imageAi ? <img src={imageAi} alt="AI" /> : <Logo />}
      </div>
      <p className="sharelyai-webcontroller-text">{text}</p>
      <div className="sharelyai-webcontroller-dot-flashing"></div>
    </LoaderWrapper>
  );
};
