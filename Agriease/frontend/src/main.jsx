import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "react-toastify/dist/ReactToastify.css";
import "./styles/theme.css";
import { LanguageProvider } from "./context/LanguageContext";
import { ThemeProvider } from "./context/ThemeContext";
import MuiThemeProvider from "./context/MuiThemeProvider";


ReactDOM.createRoot(document.getElementById("root")).render(
  <ThemeProvider>
    <MuiThemeProvider>
      <LanguageProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </LanguageProvider>
    </MuiThemeProvider>
  </ThemeProvider>
);
