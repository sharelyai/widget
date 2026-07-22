import styled, { css } from 'styled-components';

export const Wrapper: any = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;

  & > .title {
    color: ${({ theme }) => theme.colors.fiord};
    font-size: ${({ theme }) => theme.fonts.xs};
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  & > .sources {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    & > .source {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      background: ${({ theme }) => theme.colors.athensGray2};
      border-radius: 6px;
      color: ${({ theme }) => theme.colors.ebony};
      font-size: ${({ theme }) => theme.fonts.xs};
      cursor: pointer;
      transition: background 0.2s;

      &:hover {
        background: ${({ theme }) => theme.colors.athensGray4};
      }
    }
  }
`;

export const SourcesModalContent: any = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 24px;
    max-height: 80vh;
    overflow-y: auto;

    & > .source-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding-bottom: 20px;
      border-bottom: 1px solid ${theme.colors.athensGray2};

      &:last-child {
        border-bottom: none;
        padding-bottom: 0;
      }

      & > .source-header {
        display: flex;
        align-items: center;
        gap: 10px;

        & > .index {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background: ${theme.colors.indigo};
          color: ${theme.colors.white};
          border-radius: 50%;
          font-size: ${theme.fonts.xs};
          font-weight: 600;
        }

        & > .title {
          color: ${theme.colors.ebony};
          font-size: ${theme.fonts.base};
          font-weight: 600;
          flex: 1;
        }

        & > .link {
          color: ${theme.colors.indigo};
          text-decoration: none;
          font-size: ${theme.fonts.sm};
          display: flex;
          align-items: center;
          gap: 4px;

          &:hover {
            text-decoration: underline;
          }
        }
      }

      & > .snippet {
        color: ${theme.colors.fiord};
        font-size: ${theme.fonts.sm};
        line-height: 1.5;
        background: ${theme.colors.whiteLilac};
        padding: 12px;
        border-radius: 8px;
      }

      & > .metadata {
        display: flex;
        gap: 12px;
        color: ${theme.colors.gullGray};
        font-size: ${theme.fonts.xs};
      }
    }
  `}
`;

export const ModalWrapper: any = styled.div`
  ${({ theme }) => css`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;

    & > .modal-container {
      background: ${theme.colors.white};
      width: 100%;
      max-width: 800px;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: ${theme.shadows.highDepthShadow};

      & > .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 24px;
        border-bottom: 1px solid ${theme.colors.athensGray2};

        & > .title {
          color: ${theme.colors.ebony};
          font-size: ${theme.fonts.lg};
          font-weight: 600;
        }

        & > .close {
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          color: ${theme.colors.paleSky};
          display: flex;
          align-items: center;
          justify-content: center;

          &:hover {
            color: ${theme.colors.ebony};
          }
        }
      }
    }
  `}
`;