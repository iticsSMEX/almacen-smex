import styled from "styled-components";
import { Link } from "react-router-dom";
import { DataModulosConfiguracion } from "../../utils/dataEstatica";

export function ConfiguracionTemplate() {
  return (
    <Container>
      <header>
        <h1>Configuración</h1>
        <p>Catálogos y parámetros del almacén</p>
      </header>
      <div id="cards">
        {DataModulosConfiguracion.map((item, index) => (
          <Link to={item.link} className="card" key={index}>
            <div className="card-image">
              <img src={item.icono} alt={item.title} />
            </div>
            <div className="card-info">
              <h3>{item.title}</h3>
              <h4>{item.subtitle}</h4>
            </div>
          </Link>
        ))}
      </div>
    </Container>
  );
}

const Container = styled.div`
  min-height: 100%;
  padding: 24px;
  background: ${({ theme }) => theme.bgtotal};
  color: ${({ theme }) => theme.text};

  header {
    margin-bottom: 20px;

    h1 {
      font-size: 18px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: ${({ theme }) => theme.text};
      margin: 0;
    }

    p {
      font-size: 13px;
      font-weight: 400;
      color: ${({ theme }) => theme.textMuted};
      margin: 4px 0 0;
    }
  }

  #cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 12px;
    max-width: 960px;
  }

  .card {
    background: ${({ theme }) => theme.bg};
    border: 1px solid ${({ theme }) => theme.border};
    border-radius: ${({ theme }) => theme.radius};
    padding: 20px;
    text-decoration: none;
    display: flex;
    flex-direction: column;
    gap: 14px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
    transition: box-shadow 0.15s ease, transform 0.15s ease, border-color 0.15s ease;

    &:hover {
      border-color: ${({ theme }) => theme.primary};
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
      transform: translateY(-1px);
    }
  }

  .card-image {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    height: 48px;

    img {
      height: 40px;
      width: 40px;
      object-fit: contain;
      opacity: 0.8;
    }
  }

  .card-info h3 {
    font-size: 13px;
    font-weight: 700;
    color: ${({ theme }) => theme.text};
    margin: 0;
    letter-spacing: 0.02em;
  }

  .card-info h4 {
    font-size: 12px;
    font-weight: 400;
    color: ${({ theme }) => theme.textMuted};
    margin: 6px 0 0;
    line-height: 1.4;
  }
`;
