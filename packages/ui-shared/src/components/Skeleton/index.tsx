import ContentLoader, { IContentLoaderProps } from "react-content-loader";
import { useTheme } from "styled-components";

export interface ISkeletonProps extends IContentLoaderProps {
  borderRadius?: string;
}

export const Skeleton = (props: ISkeletonProps) => {
  const theme = useTheme();

  return (
    <ContentLoader
      animate={true}
      speed={2}
      width="100%"
      height="100%"
      backgroundColor={theme.colors.athensGray3}
      foregroundColor={theme.colors.white}
      style={{
        width: props?.width || "100%",
        height: props?.height || "100%",
        borderRadius: props?.borderRadius || "50px",
      }}
    >
      <rect x="0" y="0" width="100%" height="100%" />
    </ContentLoader>
  );
};
