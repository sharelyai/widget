import { useEffect, useRef, useState, ReactNode } from "react";
import styled from "styled-components";

import { defaultTheme } from "../../theme";
import { ArrowDown, CheckboxOutline, CheckboxOutlineFilled } from "../../icons";

// 1. Define MultiSelectOption interface
export interface MultiSelectOption {
  id: string | number;
  label: string;
  selected?: boolean;
  [key: string]: any; // Allow other properties
}

// 2. Define ButtonMultiSelectProps interface
export interface ButtonMultiSelectProps {
  children: ReactNode;
  options?: MultiSelectOption[];
  multiple?: boolean;
  onChange?: (selected: MultiSelectOption[]) => void;
  arrow?: boolean;
  optionLabel?: string;
  padding?: string;
}

const Wrapper: any = styled.div`
  // Explicitly type styled component
  position: relative;
  display: inline-block;
`;

const TagSelectorButton: any = styled.button.withConfig({
  shouldForwardProp: (prop) => !prop.startsWith("$"),
})<{ $isOpen: boolean; $padding?: string }>`
  background: none;
  display: flex;
  width: 100%;
  height: 48px;
  padding: ${({ $padding }) => $padding || "6px 20px"};
  align-items: center;
  gap: 6px;
  border-radius: 100px;
  cursor: pointer;
  border: none;
  border: 1px solid
    ${({ theme, $isOpen }) =>
      $isOpen ? theme.colors.indigo : theme.colors.athensGray2};
  color: ${({ theme }) => theme.colors.OxfordBlue};
  text-align: center;
  font-size: ${({ theme }) => theme.fonts.sm};
  font-style: normal;
  font-weight: 500;
  line-height: 20px;

  svg {
    fill: ${({ theme }) => theme.colors.paleSky};
    transition: transform 0.3s ease;
  }
`;

const Dropdown: any = styled.div`
  // Explicitly type styled component
  position: absolute;
  top: 120%;
  right: 0;
  background: white;
  border: 1px solid #e0e0e0;
  box-shadow: ${({ theme }) => theme.shadows.small};
  border-radius: 12px;
  z-index: 100;
  width: 270px;

  & > .footer {
    display: flex;
    padding: 12px 16px;
    justify-content: flex-end;
    align-items: center;
    gap: 10px;
    align-self: stretch;
  }
`;

const Option: any = styled.label`
  // Explicitly type styled component
  display: flex;
  padding: 8px 16px;
  align-items: center;
  gap: 8px;
  align-self: stretch;
  color: ${({ theme }) => theme.colors.fiord};
  font-size: ${({ theme }) => theme.fonts.sm};
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  cursor: pointer;
`;

const OptionLabel: any = styled.label`
  // Explicitly type styled component
  display: flex;
  padding: 16px;
  justify-content: space-between;
  align-items: center;
  align-self: stretch;
  color: ${({ theme }) => theme.colors.ebony};
  font-size: ${({ theme }) => theme.fonts.base};
  font-style: normal;
  font-weight: 600;
  line-height: normal;
`;

const SaveButton: any = styled.button`
  // Explicitly type styled component
  cursor: pointer;
  display: flex;
  padding: 10px 16px;
  justify-content: center;
  align-items: center;
  gap: 8px;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.indigo};
  border: none;
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.fonts.sm};
  font-style: normal;
  font-weight: 600;
  line-height: 20px;
`;

export const ButtonMultiSelect = ({
  children,
  options = [],
  multiple = true,
  onChange,
  arrow = true,
  optionLabel = "Filter by tags",
  padding,
}: ButtonMultiSelectProps) => {
  // Use ButtonMultiSelectProps
  const [open, setOpen] = useState(false);
  const [localOptions, setLocalOptions] = useState<MultiSelectOption[]>([]); // Explicitly type useState
  const wrapperRef = useRef<HTMLDivElement>(null); // Explicitly type useRef

  useEffect(() => {
    setLocalOptions(
      options.map((opt) => ({ ...opt, selected: opt.selected ?? false })),
    );
  }, [options]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Explicitly type event
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        // Cast event.target to Node
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleOption = (clickedOption: MultiSelectOption) => {
    // Explicitly type clickedOption
    setLocalOptions((prev: MultiSelectOption[]) =>
      // Explicitly type prev
      prev.map((option) => {
        if (option.id !== clickedOption.id) {
          if (!multiple) return { ...option, selected: false };
          return option;
        }
        return { ...option, selected: !option.selected };
      }),
    );
  };

  const handleSave = () => {
    const selectedOptions = localOptions.filter((opt) => opt.selected);
    onChange?.(selectedOptions);
    setOpen(false);
  };

  return (
    <Wrapper ref={wrapperRef}>
      <TagSelectorButton
        onClick={() => setOpen((prev) => !prev)}
        $isOpen={open}
        $padding={padding}
      >
        {children}
        {arrow && (
          <ArrowDown
            style={{
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.3s ease",
            }}
          />
        )}
      </TagSelectorButton>
      {open && (
        <Dropdown>
          {optionLabel && <OptionLabel>{optionLabel}</OptionLabel>}
          {localOptions.map((option: MultiSelectOption) => (
            // Explicitly type option
            <Option key={option?.id} onClick={() => toggleOption(option)}>
              {option.selected ? (
                <CheckboxOutlineFilled
                  width={24}
                  height={24}
                  fill={defaultTheme.colors.indigo} // Use defaultTheme
                />
              ) : (
                <CheckboxOutline
                  width={24}
                  height={24}
                  fill={defaultTheme.colors.fiord} // Use defaultTheme
                />
              )}
              {option?.label}
            </Option>
          ))}
          <div className="footer">
            <SaveButton onClick={handleSave}>Save</SaveButton>
          </div>
        </Dropdown>
      )}
    </Wrapper>
  );
};
