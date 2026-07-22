import styled from "styled-components";

export const PDFPreviewWrapper: any = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;

  .pdf-header {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: center;
    background-color: ${({ theme }) => theme.colors.white};
    border-bottom: 1px solid ${({ theme }) => theme.colors.mischka};
  }

  .pdf-controls {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 16px;
  }

  .pdf-navigation-header {
    display: flex;
    align-items: center;
    gap: 10px;

    button {
      background: ${({ theme }) => theme.colors.white};
      border: 1px solid ${({ theme }) => theme.colors.mischka};
      border-radius: 4px;
      padding: 6px 12px;
      cursor: pointer;

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      &:hover:not(:disabled) {
        background-color: ${({ theme }) => theme.colors.athensGray4};
      }
    }

    span {
      font-size: 14px;
      color: ${({ theme }) => theme.colors.ebony};
    }
  }

  .pdf-container {
    flex: 1;
    position: relative;
    height: calc(100% - 50px);
    overflow: auto;
    background-color: ${({ theme }) => theme.colors.athensGray3};
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .pdf-navigation {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 15px;
    gap: 15px;
  }

  .nav-button {
    background-color: ${({ theme }) => theme.colors.white};
    border: 1px solid ${({ theme }) => theme.colors.mischka};
    border-radius: 4px;
    padding: 6px 15px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s;

    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.athensGray};
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .page-indicator {
    font-size: 14px;
    color: ${({ theme }) => theme.colors.ebony};
  }

  .pdf-title {
    font-size: 16px;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.ebony};
    max-width: 50vw;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    word-break: break-all;
    flex-shrink: 1;
  }

  .action-buttons {
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .control-button {
    background: none;
    border: none;
    cursor: pointer;
    color: ${({ theme }) => theme.colors.ebony};
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 4px;

    &:hover {
      background-color: ${({ theme }) => theme.colors.athensGray4};
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    svg {
      width: 20px;
      height: 20px;
    }
  }
  .pdf-loading,
  .pdf-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
    font-size: 16px;
    color: ${({ theme }) => theme.colors.ebony};
    padding: 20px;
    text-align: center;
  }

  .pdf-error {
    color: ${({ theme }) => theme.colors.flamingo};
  }

  .pdf-fallback {
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .fallback-link {
    margin-top: 10px;
    padding: 8px 16px;
    background-color: ${({ theme }) => theme.colors.primary};
    color: white;
    border-radius: 4px;
    text-decoration: none;
    font-weight: 500;

    &:hover {
      opacity: 0.9;
    }
  }
`;