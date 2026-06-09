import { NavLink, Outlet } from "react-router-dom";
import styled from "styled-components";

export function ReportesTemplate() {
  return (
    <Container>
      <PageContainer>
        <Content>
          <Outlet />
        </Content>
        <Sidebar>
          <SidebarSection>
            <SidebarTitle>Stock Actual</SidebarTitle>
            <SidebarItem to="stock-actual-por-producto">
              Por producto
            </SidebarItem>
            <SidebarItem to="stock-actual-todos">Todos</SidebarItem>
            <SidebarItem to="stock-bajo-minimo">Bajo del mínimo</SidebarItem>
          </SidebarSection>
          <SidebarSection>
            <SidebarTitle>Entradas y salidas</SidebarTitle>
            <SidebarItem to="kardex-entradas-salidas">Por producto</SidebarItem>
          </SidebarSection>
          <SidebarSection>
            <SidebarTitle>Valorizado</SidebarTitle>
            <SidebarItem to="inventario-valorado">Todos</SidebarItem>
          </SidebarSection>
        </Sidebar>
      </PageContainer>
    </Container>
  );
}

const Content = styled.div`
  padding: 20px;
  flex: 1;
  min-width: 0;
`;

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;

  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

const Container = styled.div`
  min-height: 100%;
  padding: 16px 20px 24px;
  width: 100%;
  background: ${({ theme }) => theme.bgtotal};
  color: ${({ theme }) => theme.text};
`;

const Sidebar = styled.div`
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (min-width: 768px) {
    width: 240px;
    order: 2;
    flex-shrink: 0;
  }
`;

const SidebarSection = styled.div`
  background: ${({ theme }) => theme.bg};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: ${({ theme }) => theme.radius};
  padding: 12px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
`;

const SidebarTitle = styled.h3`
  margin: 0 0 10px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.textSubtle};
`;

const SidebarItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: ${({ theme }) => theme.radiusSm};
  text-decoration: none;
  color: ${({ theme }) => theme.textMuted};
  font-size: 13px;
  font-weight: 500;
  margin: 2px 0;
  transition: background 0.15s ease, color 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.bg2};
    color: ${({ theme }) => theme.text};
  }

  &.active {
    background: ${({ theme }) => theme.bg6};
    color: ${({ theme }) => theme.primary};
    font-weight: 600;
  }
`;
