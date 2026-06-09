import styled from "styled-components";
import { HashLoader } from "react-spinners";

export function SpinnerLoader({ compact = false }) {
  return (
    <Container $compact={compact}>
      <HashLoader color="#4F46E5" size={compact ? 48 : 120} />
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  ${({ $compact }) =>
    $compact
      ? `
    min-height: 200px;
    width: 100%;
    padding: 40px 0;
  `
      : `
    height: 100vh;
    width: 100vw;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000;
  `}
  background: ${({ theme }) => theme.bgtotal};
`;
