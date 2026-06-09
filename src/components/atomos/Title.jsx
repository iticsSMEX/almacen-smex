import styled from "styled-components";

export const Title = styled.h1`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  letter-spacing: 0.05em;
  text-transform: uppercase;
  line-height: 1.2;
  margin: 0;
  flex: 1;
  min-width: 0;
`;
