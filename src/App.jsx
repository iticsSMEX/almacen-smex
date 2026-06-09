import { MyRoutes, Light, Dark } from "./index";

import { createContext, useState } from "react";
import { ThemeProvider } from "styled-components";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export const ThemeContext = createContext(null);
function App() {
  const [themeuse, setTheme] = useState("light");
  const theme = themeuse === "light" ? "light" : "dark";
  const themeStyle = theme === "light" ? Light : Dark;

  return (
    <>
      <ThemeContext.Provider value={{ theme, setTheme }}>
        <ThemeProvider theme={themeStyle}>
          <MyRoutes />
          {import.meta.env.DEV && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}
        </ThemeProvider>
      </ThemeContext.Provider>
    </>
  );
}

export default App;
