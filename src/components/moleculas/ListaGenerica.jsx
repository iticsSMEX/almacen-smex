import styled from "styled-components";
import { Device, v, BtnCerrar } from "../../index";
export function ListaGenerica({
  data,
  setState,
  funcion,
  scroll,
  bottom,
  getSubtitle,
}) {
  function seleccionar(p) {
    funcion(p);
    setState();
  }
  return (
    <Container $scroll={scroll} $bottom={bottom}>
      <section className="contentClose">
        <BtnCerrar funcion={setState} />
      </section>
      <section className="contentItems">
        {data?.length ? (
          data.map((item, index) => {
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
          <SinResultados>Sin coincidencias. Pruebe otro nombre o código.</SinResultados>
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
  bottom: ${(props)=>props.$bottom};
  width: 100%;
  padding: 10px;
  border-radius: 10px;
  gap: 10px;
  z-index: 3;
  height:230px;
  @media ${() => Device.tablet} {
    width: 400px;
  }
  .contentItems {
    overflow-y: ${(props) => props.$scroll};
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
