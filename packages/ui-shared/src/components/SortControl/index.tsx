import { useEffect, useRef, useState } from "react";
import styled from "styled-components";

import { ArrowDown } from "../../icons";

export interface SortControlOption {
  key: string;
  label: string;
}

export interface SortControlProps {
  /** Currently selected option key. */
  value: string;
  options: SortControlOption[];
  onChange: (key: string) => void;
  /** Trigger label prefix, e.g. "Sort". */
  label?: string;
  /** Optional style override for the trigger button. */
  style?: React.CSSProperties;
}

const Wrapper: any = styled.div`
  position: relative;
  display: inline-block;
`;

const Trigger: any = styled.button.withConfig({
  shouldForwardProp: (prop: string) => !prop.startsWith("$"),
})<{ $isOpen: boolean }>`
  background: none;
  display: flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 6px 14px;
  border-radius: 100px;
  cursor: pointer;
  border: 1px solid
    ${({ theme, $isOpen }) =>
      $isOpen ? theme.colors.indigo : theme.colors.athensGray2};
  color: ${({ theme }) => theme.colors.OxfordBlue};
  font-size: ${({ theme }) => theme.fonts.sm};
  font-weight: 500;
  line-height: 20px;
  white-space: nowrap;

  & > svg {
    width: 16px;
    height: 16px;
    fill: ${({ theme }) => theme.colors.paleSky};
    transition: transform 0.2s ease;
    transform: rotate(${({ $isOpen }) => ($isOpen ? "180deg" : "0deg")});
  }
`;

const Dropdown: any = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 20;
  min-width: 160px;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.athensGray2};
  border-radius: 12px;
  box-shadow: ${({ theme }) => theme.shadows?.medium || "0 8px 24px rgba(0,0,0,0.12)"};
  padding: 6px;
  display: flex;
  flex-direction: column;
`;

const Option: any = styled.button.withConfig({
  shouldForwardProp: (prop: string) => !prop.startsWith("$"),
})<{ $active: boolean }>`
  background: ${({ theme, $active }) =>
    $active ? theme.colors.whiteLilac2 : "transparent"};
  border: none;
  cursor: pointer;
  text-align: left;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: ${({ theme }) => theme.fonts.sm};
  font-weight: ${({ $active }) => ($active ? 600 : 500)};
  color: ${({ theme }) => theme.colors.OxfordBlue};

  &:hover {
    background: ${({ theme }) => theme.colors.whiteLilac2};
  }
`;

export const SortControl = ({
  value,
  options,
  onChange,
  label = "Sort",
  style,
}: SortControlProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const current = options.find((o) => o.key === value);

  return (
    <Wrapper ref={wrapperRef} className="sharelyai-webcontroller-sort-control">
      <Trigger
        type="button"
        $isOpen={isOpen}
        style={style}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span>
          {label}
          {current ? `: ${current.label}` : ""}
        </span>
        <ArrowDown />
      </Trigger>
      {isOpen && (
        <Dropdown role="listbox">
          {options.map((option) => (
            <Option
              key={option.key}
              type="button"
              role="option"
              aria-selected={option.key === value}
              $active={option.key === value}
              onClick={() => {
                onChange(option.key);
                setIsOpen(false);
              }}
            >
              {option.label}
            </Option>
          ))}
        </Dropdown>
      )}
    </Wrapper>
  );
};
