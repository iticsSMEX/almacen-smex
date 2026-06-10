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
  padding: 12px 14px;
  flex: 1;
  min-width: 0;
  position: relative;

  @media (min-width: 768px) {
    padding: 14px 16px;
  }
`;

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
  gap: 10px;

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: flex-start;
    gap: 12px;
  }
`;

const Container = styled.div`
  min-height: 100%;
  padding: 12px 14px 20px;
  width: 100%;
  background: ${({ theme }) => theme.bgtotal};
  color: ${({ theme }) => theme.text};
`;

const Sidebar = styled.div`
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;

  @media (min-width: 768px) {
    width: 168px;
    order: 2;
    flex-shrink: 0;
  }
`;

const SidebarSection = styled.div`
  background: ${({ theme }) => theme.bg};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: ${({ theme }) => theme.radiusSm};
  padding: 8px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
`;

const SidebarTitle = styled.h3`
  margin: 0 0 6px;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.textSubtle};
`;

const SidebarItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px;
  border-radius: ${({ theme }) => theme.radiusSm};
  text-decoration: none;
  color: ${({ theme }) => theme.textMuted};
  font-size: 12px;
  font-weight: 500;
  margin: 1px 0;
  line-height: 1.3;
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
