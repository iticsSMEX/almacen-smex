import styled from "styled-components";

export const PageContainer = styled.div`
  min-height: 100%;
  padding: 16px 20px 24px;
  width: 100%;
  background: ${({ theme }) => theme.bgtotal};
  color: ${({ theme }) => theme.text};
  display: grid;
  grid-template:
    "header" 56px
    "area1" auto
    "area2" 48px
    "main" auto;
  gap: 12px;

  .header {
    grid-area: header;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  .area1,
  .tipo {
    grid-area: area1;
    display: flex;
    align-items: center;
  }

  .area2 {
    grid-area: area2;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  .main {
    grid-area: main;
  }
`;

export const PageFilterRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 12px;
`;
