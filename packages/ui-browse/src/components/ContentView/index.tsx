import styled from "styled-components";

import { useBrowseStorage } from "../../stores/browseStore";
import { InitialCategories } from "./components/initialCategories";
import { CategoriesDetails } from "./components/categoriesDetails";

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  align-self: stretch;
  width: 100%;
  height: 100%;
  overflow: hidden;

  & > .list {
    height: 99%;
    width: 100%;
    overflow: hidden;
  }
`;

export const BodySearch = () => {
  const { treeCategoriesLevelData } = useBrowseStorage();

  return (
    <Container>
      {!treeCategoriesLevelData && <InitialCategories />}
      {treeCategoriesLevelData && <CategoriesDetails />}
    </Container>
  );
};
