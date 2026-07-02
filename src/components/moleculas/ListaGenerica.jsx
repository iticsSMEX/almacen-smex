import { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { FaSearch } from "react-icons/fa";
import { Device, BtnCerrar } from "../../index";
import { normalizeProductoSearchText } from "../../utils/producto-busqueda";

function filtrarPorTexto(items, query, campo = "descripcion") {
  const q = normalizeProductoSearchText(query);
  if (!q) return items ?? [];
  return (items ?? []).filter((item) =>
    normalizeProductoSearchText(item?.[campo]).includes(q),
  );
}

export function ListaGenerica({
  data,
  setState,
  funcion,
  scroll,
  bottom,
  getSubtitle,
  buscable = false,
  searchPlaceholder = "Buscar...",
  searchField = "descripcion",
}) {
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const inputRef = useRef(null);

  const itemsFiltrados = useMemo(
    () =>
      buscable ? filtrarPorTexto(data, textoBusqueda, searchField) : (data ?? []),
    [buscable, data, textoBusqueda, searchField],
  );

  useEffect(() => {
    if (!buscable) return;
    const timer = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, [buscable]);

  function seleccionar(p) {
    funcion(p);
    setState();
  }

  return (
    <Container $scroll={scroll} $bottom={bottom} $buscable={buscable}>
      <section className="contentClose">
        <BtnCerrar funcion={setState} />
      </section>
      {buscable ? (
        <BuscadorLista
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <FaSearch className="icono" />
          <input
            ref={inputRef}
            type="search"
            value={textoBusqueda}
            onChange={(e) => setTextoBusqueda(e.target.value)}
            placeholder={searchPlaceholder}
            onKeyDown={(e) => e.stopPropagation()}
          />
        </BuscadorLista>
      ) : null}
      <section className="contentItems">
        {itemsFiltrados.length ? (
          itemsFiltrados.map((item, index) => {
            const subtitulo = getSubtitle?.(item);
            return (
              <ItemContainer key={item.id ?? index} onClick={() => seleccionar(item)}>
                <span>💎</span>
                <ItemTexto>
                  <span className="titulo">{item.descripcion}</span>
                  {subtitulo ? (
                    <span className="subtitulo">{subtitulo}</span>
                  ) : null}
                </ItemTexto>
              </ItemContainer>
            );
          })
        ) : (
          <SinResultados>
            {buscable && textoBusqueda.trim()
              ? "Sin coincidencias para esa búsqueda."
              : "Sin coincidencias. Pruebe otro nombre o código."}
          </SinResultados>
        )}
      </section>
    </Container>
  );
}
const Container = styled.div`
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.body};
  color: ${({ theme }) => theme.text};
  position: absolute;
  margin-bottom: 15px;
  bottom: ${(props) => props.$bottom};
  width: 100%;
  padding: 10px;
  border-radius: 10px;
  gap: 10px;
  z-index: 3;
  height: ${({ $buscable }) => ($buscable ? "280px" : "230px")};
  @media ${() => Device.tablet} {
    width: 400px;
  }
  .contentItems {
    flex: 1;
    min-height: 0;
    overflow-y: ${(props) => props.$scroll};
  }
`;

const BuscadorLista = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  height: 34px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.bg};

  .icono {
    font-size: 12px;
    opacity: 0.65;
    flex-shrink: 0;
  }

  input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font-family: inherit;
    font-size: 13px;
    color: ${({ theme }) => theme.text};

    &::placeholder {
      color: ${({ theme }) => theme.textSubtle};
    }
  }
`;
const ItemContainer = styled.div`
  gap: 10px;
  display: flex;
  padding: 10px;
  border-radius: 10px;
  cursor: pointer;
  transition: 0.3s;

  &:hover {
    background-color: ${({ theme }) => theme.bgtotal};
  }
`;
const ItemTexto = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;

  .titulo {
    font-weight: 500;
  }

  .subtitulo {
    font-size: 11px;
    opacity: 0.75;
    word-break: break-word;
  }
`;
const SinResultados = styled.p`
  padding: 12px 10px;
  margin: 0;
  font-size: 13px;
  opacity: 0.8;
`;
