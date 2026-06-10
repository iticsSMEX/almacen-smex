import styled from "styled-components";
import { useEmpresaStore } from "../store/EmpresaStore";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { notifyShonanInventoryReady } from "../utils/embedShonan";
import { Sidebar } from "../components/organismos/sidebar/Sidebar";
import { Menuambur } from "../components/organismos/Menuambur";
import { Device } from "../styles/breakpoints";
import { SpinnerLoader } from "../components/moleculas/SpinnerLoader";

export function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { mostrarEmpresaPorDefecto, dataempresa } = useEmpresaStore();

  const { isLoading, error } = useQuery({
    queryKey: ["cargar empresa inventario"],
    queryFn: () => mostrarEmpresaPorDefecto(),
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const hasEmpresaId = dataempresa?.id != null;
  const empresaResuelta = hasEmpresaId || !isLoading;

  useEffect(() => {
    if (empresaResuelta) {
      notifyShonanInventoryReady();
    }
  }, [empresaResuelta]);

  if (isLoading && !hasEmpresaId) {
    return <SpinnerLoader compact />;
  }
  if (error && !hasEmpresaId) {
    return <h1>Error al cargar la aplicación.</h1>;
  }

  if (!hasEmpresaId) {
    return (
      <AvisoInicial>
        <h1>No se encontró empresa</h1>
        <p>
          Crea un registro en la tabla <code>empresa</code> en Supabase o define{" "}
          <code>VITE_DEFAULT_EMPRESA_ID</code> en <code>.env</code>.
        </p>
      </AvisoInicial>
    );
  }

  return (
    <Container className={sidebarOpen ? "active" : ""}>
      <div className="ContentSidebar">
        <Sidebar
          state={sidebarOpen}
          setState={() => setSidebarOpen(!sidebarOpen)}
        />
      </div>
      <div className="ContentMenuambur">
        <Menuambur />
      </div>
      <Containerbody>{children}</Containerbody>
    </Container>
  );
}

const AvisoInicial = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px;
  text-align: center;
  background: ${({ theme }) => theme.bgtotal};
  color: ${({ theme }) => theme.text};

  code {
    background: rgba(127, 127, 127, 0.2);
    padding: 2px 6px;
    border-radius: 4px;
  }
`;

const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  min-height: 100%;
  background: ${({ theme }) => theme.bgtotal};
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui,
    sans-serif;
  transition: all 0.15s ease-in-out;

  .ContentSidebar {
    display: none;
  }
  .ContentMenuambur {
    display: block;
    position: absolute;
    left: 20px;
  }
  @media ${Device.tablet} {
    grid-template-columns: 65px 1fr;
    &.active {
      grid-template-columns: 220px 1fr;
    }
    .ContentSidebar {
      display: initial;
    }
    .ContentMenuambur {
      display: none;
    }
  }
`;

const Containerbody = styled.div`
  grid-column: 1;
  width: 100%;
  @media ${Device.tablet} {
    grid-column: 2;
  }
`;
