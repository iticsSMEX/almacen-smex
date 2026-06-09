import styled from "styled-components";
import { BannerHome } from "../../index";

export function HomeTemplate() {
  return (
    <Main>
      <BannerHome />
    </Main>
  );
}

const Main = styled.main`
  min-height: 100%;
  width: 100%;
  background-color: ${(props) => props.theme.bgtotal};
  color: ${({ theme }) => theme.text};
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
`;
