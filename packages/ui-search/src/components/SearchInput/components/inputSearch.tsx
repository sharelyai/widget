import { useEffect, useState } from "react";
import styled from "styled-components";

import {
  ArrowUpward,
  Close,
  Search,
  useResponsive,
} from "@sharelyai/widget-ui-shared";
import { useLanguage } from "@sharelyai/widget-services";

const Container: any = styled.div`
  width: 100%;
  display: flex;
  height: 52px;
  padding: 8px 8px 8px 16px;
  justify-content: space-between;
  align-items: center;
  align-self: stretch;
  border-radius: 100px;
  border: 1px solid ${({ theme }) => theme.colors.athensGray2};

  &:focus-within {
    border: 1px solid
      var(
        --web-control-styles-main_color,
        ${({ theme }) => theme.colors.indigo}
      );
  }
`;

const IconWrapper: any = styled.div`
  margin-right: 10px;
  display: flex;
  align-items: center;
  fill: ${({ theme }) => theme.colors.paleSky};
  cursor: pointer;
`;

const Input: any = styled.input`
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.fiord};
  font-size: ${({ theme }) => theme.fonts.base};
  font-style: normal;
  font-weight: 400;
  line-height: 110%;

  &::placeholder {
    color: ${({ theme }) => theme.colors.fiord};
    font-size: ${({ theme }) => theme.fonts.base};
    font-style: normal;
    font-weight: 400;
    line-height: 110%;
  }
`;

const Button: any = styled.button`
  background: none;
  border: none;
  display: flex;
  padding: 10px 16px;
  justify-content: center;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.colors.alto};
  fill: ${({ theme }) => theme.colors.alto};
  font-size: ${({ theme }) => theme.fonts.sm};
  font-style: normal;
  font-weight: 600;
  line-height: 20px;

  &:not(:disabled) {
    color: var(
      --web-control-styles-main_color,
      ${({ theme }) => theme.colors.indigo}
    );
    fill: var(
      --web-control-styles-main_color,
      ${({ theme }) => theme.colors.indigo}
    );
    cursor: pointer;
  }
`;

type SearchInputProps = {
  placeholder?: string;
  showClearButton?: boolean;
  initialValue?: string;
  onClear?: () => void;
  onSearch: (value: string) => void;
};

export const SearchInput = ({
  placeholder = "EnterKeywordsToExploreText",
  showClearButton = false,
  initialValue = "",
  onSearch,
  onClear = () => {},
}: SearchInputProps) => {
  const [value, setValue] = useState("");
  const [isSearchDisabled, setIsSearchDisabled] = useState(false);

  const { isMobile } = useResponsive();
  const { langText } = useLanguage();

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    setIsSearchDisabled(value?.trim().length === 0);
  }, [value]);

  const handleSearch = () => {
    if (!isSearchDisabled) {
      onSearch(value);
      setIsSearchDisabled(true);
    }
  };

  const handleClear = () => {
    setValue("");
    onClear();
  };

  return (
    <Container>
      <IconWrapper>
        <Search />
      </IconWrapper>
      <Input
        placeholder={langText?.[placeholder] || placeholder}
        value={value}
        onChange={(e: any) => setValue(e.target.value)}
        onKeyDown={(e: any) => {
          if (e.key === "Enter") {
            handleSearch();
          }
        }}
      />
      {showClearButton && (
        <IconWrapper onClick={handleClear}>
          <Close />
        </IconWrapper>
      )}
      {!showClearButton && (
        <Button onClick={handleSearch} disabled={isSearchDisabled}>
          {isMobile ? <ArrowUpward /> : langText?.SearchTabText}
        </Button>
      )}
    </Container>
  );
};
