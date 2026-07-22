import styled, { css } from "styled-components";

import { ListSearchItem } from "./components/listSearchItem";
import {
  ScrollBar,
  Loader,
  Skeleton,
  SortControl,
} from "@sharelyai/widget-ui-shared";
import { useSearchStorage } from "../../stores/searchStore";
import {
  useGlobalStore,
  useLanguage,
  sortResults,
  SEARCH_SORT_OPTIONS,
  type SortKey,
} from "@sharelyai/widget-services";

const Container: any = styled.div`
  ${({ theme }: { theme: any }) => css`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    align-self: stretch;
    width: 100%;
    height: 100%;
    overflow: hidden;
    padding: 0px 100px;

    @media (max-width: ${theme.screens.md}) {
      padding: 0px;
    }

    & > .results {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      gap: 16px;
      width: 100%;
      max-width: 1472px;

      @media (max-width: ${theme.screens.md}) {
        padding: 8px 16px 0 16px;
      }

      & > .resume {
        max-width: 995px;
        overflow: hidden;
        color: ${theme.colors.ebony};
        text-overflow: ellipsis;
        font-size: ${theme.fonts.sm};
        font-style: normal;
        font-weight: 600;
        line-height: 110%;
        display: flex;
        align-items: center;
        gap: 16px;

        & > div {
          width: 24px;
          height: 24px;
        }
      }
    }

    & > .list {
      height: 99%;
      width: 100%;
      overflow: hidden;
    }
  `}
`;

type ComponentProps = {
  isLoadingSearch?: boolean;
};

export const BodySearch = (props: ComponentProps) => {
  const { isLoadingSearch } = props;

  const { responseSearch, sortBy, setSortBy } = useSearchStorage();
  const { workspace, config } = useGlobalStore();
  const { t } = useLanguage();

  const hasSearch = responseSearch?.length > 0;
  const customConfig =
    workspace?.spaceStyling?.customConfig?.views?.search?.results;
  const hasCustomConfig = Boolean(customConfig);
  const showSort = Boolean(config?.displayMode?.VIEWS?.SEARCH?.SHOW_SORT);

  const sortOptions = SEARCH_SORT_OPTIONS.map((option) => ({
    key: option.key,
    label: t(option.labelKey),
  }));
  // When sort is disabled, render the native API order untouched.
  const sortedResults = showSort
    ? sortResults(responseSearch || [], sortBy as SortKey)
    : responseSearch;

  return (
    <Container
      {...(hasCustomConfig && {
        style: customConfig?.containerStyles,
      })}
    >
      <div className="results">
        {(hasSearch || isLoadingSearch) && (
          <span
            className="resume"
            {...(hasCustomConfig && {
              style: customConfig?.counterStyles,
            })}
          >
            {isLoadingSearch && <Loader type="circular-loader" />}
            {!isLoadingSearch && responseSearch?.length}{" "}
            {t("DocumentsAndResourcesText")}
          </span>
        )}
        {showSort && hasSearch && !isLoadingSearch && (
          <SortControl
            value={sortBy}
            options={sortOptions}
            onChange={setSortBy}
            label={t("SortLabel")}
          />
        )}
      </div>
      <div
        className="list"
        {...(hasCustomConfig && {
          style: customConfig?.containerStyles,
        })}
      >
        <ScrollBar
          options={{ suppressScrollX: true }}
          disableComponent={customConfig?.general?.showScrollbar === false}
        >
          {sortedResults
            ?.map((item: any) => {
              return {
                ...item,
                newTitle: item?.title ?? item?.metadata?.title,
              };
            })
            ?.map((item: any) => {
              return (
                <ListSearchItem
                  key={item?.id || item?.coreKnowledge?.id}
                  {...item}
                  metadata={{
                    ...item?.metadata,
                    ...item?.uploadFileMetadata?.[0],
                    type: item?.type ?? item?.metadata?.type,
                    title: item?.title ?? item?.metadata?.title,
                    filename:
                      item?.metadata?.["filename"] ??
                      item?.metadata?.["elasticSearch.url.raw"] ??
                      item?.uploadFileMetadata?.[0]?.["filename"] ??
                      item?.content,
                  }}
                />
              );
            })}
          {isLoadingSearch &&
            Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} width={"100%"} height={83} borderRadius="8px" />
            ))}
        </ScrollBar>
      </div>
    </Container>
  );
};
