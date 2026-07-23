import styled from "styled-components";

export const ToggleWrapper = styled.div`
  display: flex;
  height: 36px;
  padding: 3px;
  align-items: flex-start;
  gap: 8px;
  border-radius: 12px;
  background: var(
    --web-control-styles-main_card_background,
    ${({ theme }) => theme.colors.whiteLilac2}
  );
`;

export const ToggleButton = styled.button<{ $active?: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 11px 10px;
  gap: 10px;
  align-self: stretch;
  border-radius: 8px;
  background: ${({ $active, theme }) =>
    $active ? theme.colors.white : "transparent"};
  box-shadow: ${({ $active }) =>
    $active ? "0px 0.5px 4px 0px rgba(0, 0, 0, 0.08)" : "none"};
  overflow: hidden;
  color: ${({ theme }) => theme.colors.ebony};
  text-overflow: ellipsis;
  font-size: ${({ theme }) => theme.fonts.sm};
  font-style: normal;
  font-weight: 500;
  line-height: 110%;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  width: max-content;
  min-width: 71px;

  &:focus {
    outline: none;
  }

  @media (max-width: ${({ theme }) => theme.screens.lg}) {
    padding: 11px 10px;
  }
`;
