import styled from "styled-components";

export function CardDatosEmpresa({ titulo, valor, img, onClick, subtitulo }) {
  const interactive = typeof onClick === "function";

  return (
    <Container
      as={interactive ? "button" : "div"}
      type={interactive ? "button" : undefined}
      onClick={onClick}
      $clickable={interactive}
    >
      <p className="pricing-plan">{titulo}</p>
      <div className="price-value">
        {valor && <p className="price-number">{valor}</p>}
        {img && <img src={img} alt={titulo ?? ""} />}
      </div>
      {subtitulo && <p className="pricing-note">{subtitulo}</p>}
    </Container>
  );
}

const Container = styled.div`
  background: ${({ theme }) => theme.bg};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: ${({ theme }) => theme.radius};
  padding: 16px 20px;
  min-width: 160px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
  transition: box-shadow 0.15s ease, transform 0.15s ease, border-color 0.15s ease;
  text-align: left;
  font: inherit;
  color: inherit;
  appearance: none;
  width: auto;

  ${({ $clickable, theme }) =>
    $clickable &&
    `
    cursor: pointer;

    &:hover {
      border-color: ${theme.primary};
    }

    &:focus-visible {
      outline: 2px solid ${theme.primary};
      outline-offset: 2px;
    }
  `}

  &:hover {
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
    transform: translateY(-1px);
  }

  .pricing-plan {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${({ theme }) => theme.textSubtle};
    margin: 0 0 8px;
  }

  .price-value {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .price-number {
    font-size: 20px;
    font-weight: 700;
    color: ${({ theme }) => theme.text};
    letter-spacing: -0.02em;
    margin: 0;
  }

  img {
    width: 32px;
    height: 32px;
    object-fit: contain;
    opacity: 0.75;
  }

  .pricing-note {
    font-size: 11px;
    font-weight: 400;
    color: ${({ theme }) => theme.textMuted};
    margin: 8px 0 0;
  }
`;
