import { useState } from "react";
import styled from "styled-components";
import { v, TablaKardex, useKardexStore } from "../../index";

export function Tabs() {
  const [activeTab, setactiveTab] = useState(0);
  const { datakardex } = useKardexStore();

  return (
    <Container>
      <ul className="tabs">
        <li
          className={activeTab === 0 ? "active" : ""}
          onClick={() => setactiveTab(0)}
        >
          {<v.iconopie />}
          Kardex
        </li>
      </ul>

      <div className="tab-content">
        {activeTab === 0 && <TablaKardex data={datakardex} />}
      </div>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  background: ${({ theme }) => theme.bg};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: ${({ theme }) => theme.radius};
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);

  .tabs {
    list-style: none;
    display: flex;
    gap: 0;
    margin: 0;
    padding: 0 16px;
    border-bottom: 1px solid ${({ theme }) => theme.border};
    background: ${({ theme }) => theme.bg2};

    li {
      display: flex;
      align-items: center;
      gap: 8px;
      height: 44px;
      padding: 0 14px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: ${({ theme }) => theme.textSubtle};
      cursor: pointer;
      border-bottom: 2px solid transparent;
      margin-bottom: -1px;
      transition: color 0.15s ease, border-color 0.15s ease;

      svg {
        width: 14px;
        height: 14px;
        opacity: 0.7;
      }

      &.active {
        color: ${({ theme }) => theme.primary};
        border-bottom-color: ${({ theme }) => theme.primary};

        svg {
          opacity: 1;
          color: ${({ theme }) => theme.primary};
        }
      }

      &:hover:not(.active) {
        color: ${({ theme }) => theme.textMuted};
      }
    }
  }

  .tab-content {
    padding: 0;
    width: 100%;
  }
`;
