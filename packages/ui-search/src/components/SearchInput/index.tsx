import styled, { css } from "styled-components";
import { SearchInput } from "./components/inputSearch";
import {
  ButtonMultiSelect,
  Close,
  Tag,
  Tune,
  useResponsive,
} from "@sharelyai/widget-ui-shared";

type WrapperProps = {
  $hasSearch?: boolean;
};

const Wrapper: any = styled.div.withConfig({
  shouldForwardProp: (prop) => !prop?.startsWith("$"),
})<WrapperProps>`
  ${({ theme, $hasSearch }: { theme: any; $hasSearch?: boolean }) => css`
    display: flex;
    flex-direction: column;
    padding: 20px 120px;
    gap: 20px;

    @media (max-width: ${theme.screens.md}) {
      padding: 20px 16px 24px 16px;
    }

    ${
      $hasSearch &&
      css`
        padding: 16px 120px;
      `
    }

    & > .content {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
      align-self: stretch;
    }

    & > .tags-content {
      display: flex;
      align-items: center;
      gap: 8px;
      align-self: stretch;

      & > .tag {
        border: none;
        display: flex;
        padding: 6px 14px;
        align-items: center;
        gap: 6px;
        border-radius: 16px;
        background: ${theme.colors.whiteLilac2};
        color: ${theme.colors.indigo};
        text-align: center;
        font-size: ${theme.fonts.sm};
        font-style: normal;
        font-weight: 600;
        line-height: 20px;
        cursor: pointer;

        & > svg {
          width: 18px;
          height: 18px;

          &:first-child {
            color: ${theme.colors.indigo};
            fill: ${theme.colors.indigo};
          }

          &:last-child {
            color: ${theme.colors.paleSky};
            fill: ${theme.colors.paleSky};
          }
        }
      }
    }
  `}
`;

type ComponentProps = {
  hasSearch?: boolean;
  searchInputProps: Parameters<typeof SearchInput>[0];
  showTags?: boolean;
  tags: {
    id: string;
    label: string;
    selected: boolean;
  }[];
  onChangeTags: (tags: any[]) => void;
};

export const Search = (props: ComponentProps) => {
  const {
    hasSearch = false,
    showTags = false,
    searchInputProps,
    tags,
    onChangeTags,
  } = props;

  const { isMobile } = useResponsive();

  const tagsSelected = tags?.filter((tag) => tag.selected) || [];

  const handleRemoveTag = (tagId: string) => {
    const updatedTags = tagsSelected.filter((tag) => tag.id !== tagId);
    onChangeTags(updatedTags);
  };

  return (
    <Wrapper $hasSearch={hasSearch}>
      <div className="content">
        <SearchInput {...searchInputProps} />
        {hasSearch && showTags && (
          <ButtonMultiSelect
            onChange={onChangeTags}
            options={tags}
            multiple={true}
            arrow={!isMobile}
            padding="10px 12px"
          >
            {isMobile ? (
              <Tune />
            ) : (
              <>
                <Tag />
                Tags
              </>
            )}
          </ButtonMultiSelect>
        )}
      </div>
      {tagsSelected.length > 0 && (
        <div className="tags-content">
          {tagsSelected.map((tag) => (
            <button
              key={tag.id}
              className="tag"
              onClick={() => handleRemoveTag(tag.id)}
            >
              <Tag viewBox="0 0 16 16" />
              {tag.label}
              <Close viewBox="0 0 16 16" />
            </button>
          ))}
        </div>
      )}
    </Wrapper>
  );
};
