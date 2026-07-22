import ContentLoader, { IContentLoaderProps } from "react-content-loader";
import { useTheme } from "styled-components";

export const InputSkeleton = (props: IContentLoaderProps) => {
  const theme = useTheme();

  return (
    <ContentLoader
      speed={2}
      width="100%"
      height="100%"
      backgroundColor={theme.colors.athensGray3}
      foregroundColor={theme.colors.white}
      style={{
        width: props.width || "100%",
        height: props.height || "100%",
        borderRadius: "50px",
      }}
      {...props}
    >
      <rect x="0" y="0" width="100%" height="100%" />
    </ContentLoader>
  );
};
