import {
  Skeleton,
  ArrowForward,
  useResponsive,
} from "@sharelyai/widget-ui-shared";
import {
  useGlobalStore,
  constants,
  useKnowledgeCategories,
  useSharelyContext,
} from "@sharelyai/widget-services";
import { useBrowseStorage } from "../../../stores/browseStore";
import styled, { css } from "styled-components";

const Wrapper: any = styled.div`
  ${({ theme }) => css`
    width: 100%;
    height: 100%;
    padding: 8px 120px;

    @media (max-width: ${theme.screens.md}) {
      padding: 20px 16px 8px 16px;
    }

    & > .initial-categories {
      display: flex;
      flex-direction: column;
      gap: 16px;
      width: 100%;
      height: 100%;
      overflow: hidden;

      & > .items {
        display: grid;
        grid-template-columns: repeat(3, minmax(177px, 100%));
        gap: 16px;
        overflow: hidden;

        @media (max-width: ${theme.screens.md}) {
          grid-template-columns: repeat(2, 1fr);
        }

        & > .item {
          background: var(
            --web-control-styles-main_card_background,
            ${({ theme }) => theme.colors.white}
          );
          padding: 16px;
          height: 71px;
          gap: 16px;
          border-radius: 12px;
          border: 1px solid
            var(
              --web-control-styles-main_card_background,
              ${(props) => props.theme.colors.athensGray6}
            );
          gap: 6px;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;

          & > svg {
            width: 18px;
            height: 18px;
            fill: var(
              --web-control-styles-main_color,
              ${(props) => props.theme.colors.ebony}
            );
          }

          & > .title {
            overflow: hidden;
            text-align: left;
            color: var(
              --web-control-styles-main_color,
              ${(props) => props.theme.colors.ebony}
            );
            text-overflow: ellipsis;
            font-size: ${(props) => props.theme.fonts.base};
            font-style: normal;
            font-weight: 600;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
          }
        }
      }
    }
  `}
`;

export const InitialCategories = () => {
  const { setTreeCategoriesLevelData, setBreadcrumb } = useBrowseStorage();
  const { treeCategories, isLoading } = useKnowledgeCategories();

  const { isMobile } = useResponsive();
  const { workspace, currentInformation } = useGlobalStore();
  const { apiClient } = useSharelyContext();

  const customConfig = workspace?.spaceStyling?.customConfig?.views?.browse;
  const hasCustomConfig = Boolean(customConfig);

  const handleCategoryClick = (category: any) => {
    setTreeCategoriesLevelData(category);
    setBreadcrumb([category]);

    apiClient.spaces.sendEvent(
      currentInformation.spaceId,
      constants.SPACE_EVENTS.SPACE_EVENT_CLICKED_CATEGORY_IN_BROWSE,
      {
        categoryId: category.id,
        categoryName: category.name,
        categoryNavigationCount: category.categoryNavigationCount,
      },
    );
  };

  return (
    <Wrapper>
      <div className="initial-categories">
        <div className="items">
          {isLoading &&
            Array.from({ length: 6 }).map((_, index) => (
              <Skeleton
                key={index}
                width="100%"
                height={60}
                borderRadius="10px"
                backgroundColor="white"
              />
            ))}
          {!isLoading &&
            Array.isArray(treeCategories) &&
            treeCategories?.map((category) => (
              <button
                key={category.id}
                className="item"
                onClick={() => handleCategoryClick(category)}
                {...(hasCustomConfig && {
                  style: isMobile
                    ? customConfig?.categoryButtons?.mobileStyle
                    : customConfig?.categoryButtons?.desktopStyle,
                })}
              >
                <span className="title">{category?.name}</span>
                {category?.categoryNavigationCount > 0 && <ArrowForward />}
              </button>
            ))}
        </div>
      </div>
    </Wrapper>
  );
};
