import styled from "styled-components";
import { Icono } from "../../index";

export function Btnsave({ funcion, titulo, bgcolor, icono, url, disabled, variant = "primary" }) {
  const buttonType = funcion ? "button" : "submit";

  return (
    <Container
      type={buttonType}
      $bgcolor={bgcolor}
      $variant={variant}
      disabled={disabled}
      onClick={(e) => {
        if (disabled) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        funcion?.(e);
      }}
    >
      {icono && (
        <Icono className="btn-icon">{icono}</Icono>
      )}
      {url ? (
        <a href={url} target="_blank" rel="noreferrer">
          {titulo}
        </a>
      ) : (
        <span>{titulo}</span>
      )}
    </Container>
  );
}

const Container = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 32px;
  padding: 0 14px;
  font-family: inherit;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  border: none;
  border-radius: ${({ theme }) => theme.radiusSm};
  cursor: pointer;
  transition: background 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
  white-space: nowrap;

  background: ${({ $bgcolor, $variant, theme }) =>
    $bgcolor ?? ($variant === "danger" ? theme.danger : theme.primary)};
  color: #ffffff;

  .btn-icon svg {
    width: 14px;
    height: 14px;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  &:hover:not(:disabled) {
    filter: brightness(0.95);
    box-shadow: 0 2px 8px rgba(79, 70, 229, 0.22);
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    box-shadow: none;
  }
`;
