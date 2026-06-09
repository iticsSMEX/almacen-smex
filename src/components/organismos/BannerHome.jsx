import styled from "styled-components";
import { useQuery } from "@tanstack/react-query";
import { useEmpresaStore } from "../../index";
import { ReportInventarioTotal } from "../../supabase/crudProductos";
import { v } from "../../styles/variables";
import { CardDatosEmpresa } from "../moleculas/CarddatosEmpresa";
import { formatTotalAlmacen } from "../../utils/Conversiones";
import { volverAComprasShonan } from "../../utils/navegacionShonan";

export function BannerHome() {
  const { dataempresa } = useEmpresaStore();
  const { data: totalAlmacen, isLoading } = useQuery({
    queryKey: ["inventario-total", dataempresa?.id],
    queryFn: () =>
      ReportInventarioTotal({ _id_empresa: dataempresa?.id }),
    enabled: !!dataempresa?.id,
    staleTime: 5 * 60 * 1000,
    placeholderData: 0,
  });

  const valorAlmacen = isLoading ? "..." : formatTotalAlmacen(totalAlmacen ?? 0);

  return (
    <Container>
      <div className="content-wrapper-context">
        <span className="titulo">
          <span className="titulo-icon">{<v.iconoempresa />}</span>
          {dataempresa?.nombre ?? "AlmacénSMEX"}
        </span>
        <p className="content-text">
          Control de inventario integrado con Shonan OS.
        </p>

        <ContentSocial>
          <CardDatosEmpresa titulo="Almacén" valor={valorAlmacen} />
          <CardDatosEmpresa
            titulo="Compras"
            valor="Shonan OS"
            subtitulo="Volver al panel"
            onClick={volverAComprasShonan}
          />
          <CardDatosEmpresa titulo="Productos" valor="Catálogo" />
          <CardDatosEmpresa titulo="Reportes" valor="KPIs" />
        </ContentSocial>
      </div>
    </Container>
  );
}

const Container = styled.div`
  width: 100%;
  min-height: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  padding: 24px;

  .content-wrapper-context {
    width: 100%;
    max-width: 960px;
    display: flex;
    flex-direction: column;
    gap: 8px;

    .titulo {
      font-size: 18px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: ${({ theme }) => theme.text};
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .titulo-icon {
      display: flex;
      align-items: center;
      color: ${({ theme }) => theme.primary};

      svg {
        width: 18px;
        height: 18px;
      }
    }

    .content-text {
      font-size: 13px;
      font-weight: 400;
      color: ${({ theme }) => theme.textMuted};
      line-height: 1.5;
      margin: 0;
    }
  }
`;

const ContentSocial = styled.section`
  display: flex;
  gap: 12px;
  padding-top: 20px;
  flex-wrap: wrap;
`;
