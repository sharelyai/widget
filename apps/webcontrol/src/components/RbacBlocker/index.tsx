import styled, { css } from "styled-components";

const RbacBlockerWrapper = styled.div`
  ${({ theme }) => css`
    position: absolute;
    width: 100%;
    height: 100%;
    padding: 20px;
    background-color: ${theme.colors.white};
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    z-index: 10;

    .rbac-blocker-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      text-align: center;
      max-width: 320px;

      p {
        margin: 0;
        color: ${theme.colors.fiord};
        font-size: 14px;
        line-height: 1.5;
      }

      button {
        padding: 10px 24px;
        background-color: var(
          --web-control-styles-main_color,
          ${theme.colors.primary}
        );
        color: ${theme.colors.white};
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: opacity 0.2s ease;

        &:hover {
          opacity: 0.9;
        }
      }
    }
  `}
`;

export const RbacBlocker = () => {
  return (
    <RbacBlockerWrapper>
      <div className="rbac-blocker-content">
        <p>Please refresh your browser.</p>
        <p>
          If that doesn't work, please contact your administrator and inform
          them that you do not have a role-based token.
        </p>
        <button onClick={() => window.location.reload()}>Refresh</button>
      </div>
    </RbacBlockerWrapper>
  );
};
