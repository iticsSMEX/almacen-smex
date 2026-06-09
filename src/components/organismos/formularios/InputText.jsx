import styled from "styled-components";

export function InputText({ children, icono }) {
  return (
    <Container>
      {icono && <span className="field-icon">{icono}</span>}
      <div className="form__group field">{children}</div>
    </Container>
  );
}

const Container = styled.div`
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 10px;

  .field-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 22px;
    color: ${({ theme }) => theme.textSubtle};

    svg {
      width: 16px;
      height: 16px;
    }
  }

  .form__group {
    position: relative;
    padding: 16px 0 0;
    width: 100%;
  }

  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus,
  input:-webkit-autofill:active {
    -webkit-background-clip: text;
    -webkit-text-fill-color: ${({ theme }) => theme.text};
    transition: background-color 5000s ease-in-out 0s;
  }

  .form__field {
    font-family: inherit;
    width: 100%;
    border: 1px solid ${({ theme }) => theme.border};
    border-radius: ${({ theme }) => theme.radiusSm};
    outline: 0;
    font-size: 13px;
    font-weight: 500;
    color: ${({ theme }) => theme.text};
    padding: 10px 12px;
    background: ${({ theme }) => theme.bg};
    transition: border-color 0.15s ease, box-shadow 0.15s ease;

    &.disabled {
      color: ${({ theme }) => theme.textMuted};
      background: ${({ theme }) => theme.bg2};
      border-style: dashed;
    }
  }

  .form__field::placeholder {
    color: transparent;
  }

  .form__field:placeholder-shown ~ .form__label {
    font-size: 13px;
    top: 26px;
    left: 12px;
  }

  .form__label {
    position: absolute;
    top: 0;
    left: 0;
    display: block;
    transition: 0.15s ease;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: ${({ theme }) => theme.textSubtle};
    pointer-events: none;
  }

  .form__field:focus {
    border-color: ${({ theme }) => theme.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.bg6};
  }

  .form__field:focus ~ .form__label {
    color: ${({ theme }) => theme.primary};
  }

  .form__field:required,
  .form__field:invalid {
    box-shadow: none;
  }

  p {
    font-size: 11px;
    color: ${({ theme }) => theme.danger};
    margin-top: 4px;
  }
`;
