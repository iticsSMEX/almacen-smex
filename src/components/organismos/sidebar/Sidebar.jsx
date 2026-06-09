import styled from "styled-components";
import {
  
  LinksArray,
  SecondarylinksArray,
  SidebarCard,
  ToggleTema,
} from "../../../index";
import {v} from "../../../styles/variables"
import { NavLink } from "react-router-dom";

export function Sidebar({ state, setState }) {

  return (
    <Main $isopen={state.toString()}>
      <span className="Sidebarbutton" onClick={() => setState(!state)}>
        {<v.iconoflechaderecha />}
      </span>
      <Container $isopen={state.toString()} className={state ? "active" : ""}>
        <div className="Logocontent">
          <div className="imgcontent">
            <img src={v.logo} />
          </div>
          <h2>AlmacénSMEX</h2>
        </div>
        {LinksArray.map(({ icon, label, to }) => (
          <div
            className={state ? "LinkContainer active" : "LinkContainer"}
            key={label}
          >
            <NavLink
              to={to}
              className={({ isActive }) => `Links${isActive ? ` active` : ``}`}
            >
              <div className="Linkicon">{icon}</div>
              <span className={state ? "label_ver" : "label_oculto"}>
                {label}
              </span>
              
            </NavLink>
          </div>
        ))}
        <Divider />
        {SecondarylinksArray.map(({ icon, label, to }) => (
          <div
            className={state ? "LinkContainer active" : "LinkContainer"}
            key={label}
          >
            <NavLink
              to={to}
              className={({ isActive }) => `Links${isActive ? ` active` : ``}`}
            >
              <div className="Linkicon">{icon}</div>
              <span className={state ? "label_ver" : "label_oculto"}>
                {label}
              </span>
             
            </NavLink>
          </div>
        ))}
        <ToggleTema/>
        <Divider />
        {state && <SidebarCard />}
      </Container>
    </Main>
  );
}
const Container = styled.div`
  color: ${(props) => props.theme.text};
  background: ${(props) => props.theme.bg};
  border-right: 1px solid ${(props) => props.theme.border};
  position: fixed;
  padding-top: 16px;
  z-index: 1;
  height: 100%;
  width: 65px;
  transition: width 0.15s ease-in-out;
  overflow-y: auto;
  overflow-x: hidden;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: ${(props) => props.theme.colorScroll};
    border-radius: 8px;
  }

  &.active {
    width: 220px;
  }

  .Logocontent {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    padding: 8px 12px 28px;

    .imgcontent {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 28px;
      height: 28px;
      flex-shrink: 0;

      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }

    h2 {
      display: ${({ $isopen }) => ($isopen === "true" ? `block` : `none`)};
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: ${(props) => props.theme.textSubtle};
      white-space: nowrap;
    }
  }

  .LinkContainer {
    margin: 2px 8px;
    border-radius: ${(props) => props.theme.radiusSm};
    transition: background 0.15s ease;
    position: relative;

    &:hover {
      background: ${(props) => props.theme.bgAlpha};
    }

    .Links {
      display: flex;
      align-items: center;
      text-decoration: none;
      padding: 10px 8px;
      color: ${(props) => props.theme.textMuted};
      min-height: 40px;
      font-size: 13px;
      font-weight: 500;
      border-radius: ${(props) => props.theme.radiusSm};

      .Linkicon {
        padding: 0 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: ${(props) => props.theme.textSubtle};

        svg {
          width: 16px;
          height: 16px;
        }
      }

      .label_ver {
        transition: opacity 0.15s ease;
        opacity: 1;
        white-space: nowrap;
      }

      .label_oculto {
        opacity: 0;
        width: 0;
        overflow: hidden;
      }

      &.active {
        color: ${(props) => props.theme.primary};
        font-weight: 600;
        background: ${(props) => props.theme.bg6};

        .Linkicon {
          color: ${(props) => props.theme.primary};
        }
      }
    }

    &.active .Links {
      padding: 10px 12px;
    }
  }
`;
const Main = styled.div`
  .Sidebarbutton {
    position: fixed;
    top: 56px;
    left: 48px;
    width: 24px;
    height: 24px;
    border-radius: 6px;
    border: 1px solid ${(props) => props.theme.border};
    background: ${(props) => props.theme.bgtgderecha};
    box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: transform 0.15s ease, background 0.15s ease;
    z-index: 2;
    transform: ${({ $isopen }) =>
      $isopen === "true" ? `translateX(162px) rotate(180deg)` : `initial`};
    color: ${(props) => props.theme.textMuted};

    svg {
      width: 12px;
      height: 12px;
    }

    &:hover {
      background: ${(props) => props.theme.bg2};
      color: ${(props) => props.theme.primary};
    }
  }
`;

const Divider = styled.div`
  height: 1px;
  width: calc(100% - 16px);
  margin: 12px auto;
  background: ${(props) => props.theme.border};
`;
