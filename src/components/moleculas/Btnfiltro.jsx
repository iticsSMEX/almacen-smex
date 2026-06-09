import styled from "styled-components";

export function Btnfiltro({ bgcolor, textcolor, icono, funcion }) {
  return (
    <Container
      $textcolor={textcolor}
      $bgcolor={bgcolor}
      onClick={funcion}
      type="button"
      aria-label="Agregar"
    >
      <span className="contentIcon">{icono}</span>
    </Container>
  );
}

const Container = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.radiusSm};
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ $bgcolor, theme }) => $bgcolor ?? theme.bg};
  color: ${({ $textcolor, theme }) => $textcolor ?? theme.textMuted};
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;

  .contentIcon {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .contentIcon svg {
    width: 16px;
    height: 16px;
  }

  &:hover {
    background: ${({ theme }) => theme.bg2};
    color: ${({ theme }) => theme.primary};
    border-color: ${({ theme }) => theme.bg6};
  }
`;
