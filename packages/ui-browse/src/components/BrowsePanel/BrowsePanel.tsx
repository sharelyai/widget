import styled from "styled-components";
import { BodySearch as ContentView } from "../ContentView";
import { Title } from "./Title";
import { useBrowseStorage } from "../../stores/browseStore";
import { useGlobalStore, useLanguage } from "@sharelyai/widget-services";
import { EmptyState } from "@sharelyai/widget-ui-shared";

export const Wrapper: any = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;

  .loader {
    width: 100%;
    height: 100%;
    flex: 1;
    align-items: center;
    justify-content: center;
  }
`;

export const WrapperEmpty: any = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

export const BrowsePanel = () => {
  const { treeCategoriesLevelData } = useBrowseStorage();
  const { config } = useGlobalStore();
  const { t } = useLanguage();

  if (config?.displayModeJSON?.browse?.comingSoon) {
    return (
      <WrapperEmpty>
        <EmptyState text={t("ComingSoon") + "..."} />
      </WrapperEmpty>
    );
  }

  return (
    <Wrapper>
      {!treeCategoriesLevelData && <Title />}
      <ContentView />
    </Wrapper>
  );
};
