import styled from "styled-components";
import { FaSearch } from "react-icons/fa";

export function Buscador({
  setBuscador,
  onFocus,
  funcion,
  onKeyDown,
  placeholder = "Buscar...",
  inputRef,
}) {
  function buscar(e) {
    setBuscador(e.target.value);
  }
  function ejecutarfuncion(e) {
    e.stopPropagation();
    funcion?.();
  }
  return (
    <Container onClick={ejecutarfuncion}>
      <FaSearch className="icono" />
      <input
        ref={inputRef}
        onFocus={onFocus}
        onChange={buscar}
        onKeyDown={(e) => onKeyDown?.(e, e.currentTarget.value)}
        placeholder={placeholder}
      />
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  height: 36px;
  width: 100%;
  max-width: 280px;
  padding: 0 12px;
  background: ${({ theme }) => theme.bg};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: ${({ theme }) => theme.radiusSm};
  color: ${({ theme }) => theme.textSubtle};

  .icono {
    font-size: 14px;
    flex-shrink: 0;
    opacity: 0.7;
  }

  input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font-family: inherit;
    font-size: 13px;
    font-weight: 400;
    color: ${({ theme }) => theme.text};

    &::placeholder {
      color: ${({ theme }) => theme.textSubtle};
    }
  }
`;
