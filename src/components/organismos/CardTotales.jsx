import styled from "styled-components";
import { useEmpresaStore } from "../../store/EmpresaStore";

export function CardTotales({ color, total, title, icono }) {
  const { dataempresa } = useEmpresaStore();
  return (
    <Container $accent={color}>
      <div className="contentTextos">
        <p className="title">{title}</p>
        <p className="total">
          {dataempresa?.simbolomoneda ?? "$"} {total}
        </p>
        <p className="subtitle">Inventario</p>
      </div>
      {icono && <div className="contentIcono">{icono}</div>}
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  background: ${({ theme }) => theme.bg};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: ${({ theme }) => theme.radius};
  padding: 16px 20px;
  width: 100%;
  min-height: 108px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
  transition: box-shadow 0.15s ease, transform 0.15s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
    transform: translateY(-1px);
  }

  .contentTextos {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;

    .title {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: ${({ theme }) => theme.textSubtle};
      margin: 0;
    }

    .total {
      font-size: 24px;
      font-weight: 700;
      color: ${({ theme }) => theme.text};
      letter-spacing: -0.02em;
      font-variant-numeric: tabular-nums;
      margin: 0;
      line-height: 1;
    }

    .subtitle {
      font-size: 11px;
      font-weight: 400;
      color: ${({ theme }) => theme.textSubtle};
      margin: 0;
    }
  }

  .contentIcono {
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${({ $accent }) => $accent ?? "#94A3B8"};
    opacity: 0.85;
    margin-top: 2px;

    svg {
      width: 16px;
      height: 16px;
    }
  }
`;
