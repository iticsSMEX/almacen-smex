import styled from "styled-components";
import { v } from "../../index";
import { useNavigate } from "react-router-dom";

export function DataUser({ stateConfig }) {
  const navigate = useNavigate();

  return (
    <Container onClick={stateConfig.setState}>
      <div className="chip-icon">{<v.iconoempresa />}</div>
      <span className="nombre">AlmacénSMEX</span>
      {stateConfig.state && (
        <MenuRapido>
          <button type="button" onClick={() => navigate("/configurar")}>
            Configuración
          </button>
        </MenuRapido>
      )}
    </Container>
  );
}

const MenuRapido = styled.div`
  position: absolute;
  top: 44px;
  right: 0;
  min-width: 180px;
  background: ${({ theme }) => theme.bgcards};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: ${({ theme }) => theme.radiusSm};
  padding: 6px;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
  z-index: 20;

  button {
    width: 100%;
    border: none;
    background: transparent;
    color: ${({ theme }) => theme.text};
    padding: 8px 10px;
    text-align: left;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;

    &:hover {
      background: ${({ theme }) => theme.bg2};
    }
  }
`;

const Container = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: ${({ theme }) => theme.radiusSm};
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.bg};
  cursor: pointer;
  transition: background 0.15s ease;

  .chip-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 6px;
    background: ${({ theme }) => theme.bg6};
    color: ${({ theme }) => theme.primary};

    svg {
      width: 14px;
      height: 14px;
    }
  }

  &:hover {
    background: ${({ theme }) => theme.bg2};
  }

  .nombre {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: ${({ theme }) => theme.text};
    white-space: nowrap;
  }
`;
