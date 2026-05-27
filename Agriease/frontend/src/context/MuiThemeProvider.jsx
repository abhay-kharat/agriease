import { useMemo } from "react";
import { ThemeProvider as MuiTP, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useTheme } from "./ThemeContext";

export default function MuiThemeProvider({ children }) {
  const { theme } = useTheme();

  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: theme,
          primary: {
            main: theme === "dark" ? "#73d28d" : "#2e7d32",
            light: "#81c784",
            dark: "#1b5e20",
          },
          secondary: {
            main: "#f59e0b",
          },
          background: {
            default: theme === "dark" ? "#091610" : "#f5fbf7",
            paper: theme === "dark" ? "#10231a" : "#ffffff",
          },
          text: {
            primary: theme === "dark" ? "#e4f4ea" : "#113322",
            secondary: theme === "dark" ? "#93b09e" : "#4d6657",
          },
          success: { main: "#22c55e" },
          warning: { main: "#f59e0b" },
          error: { main: "#ef4444" },
          info: { main: "#3b82f6" },
        },
        typography: {
          fontFamily: '"Plus Jakarta Sans", "Segoe UI", sans-serif',
        },
        shape: {
          borderRadius: 12,
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                transition: "background-color 0.3s ease, color 0.3s ease",
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                fontWeight: 600,
                fontSize: "0.8rem",
              },
            },
          },
          MuiDataGrid: {
            styleOverrides: {
              root: {
                border: "none",
                borderRadius: 16,
                "& .MuiDataGrid-cell": {
                  borderColor: theme === "dark"
                    ? "rgba(115, 210, 141, 0.1)"
                    : "rgba(46, 125, 50, 0.08)",
                },
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: theme === "dark"
                    ? "rgba(15, 33, 25, 0.6)"
                    : "rgba(245, 251, 247, 0.8)",
                  borderColor: theme === "dark"
                    ? "rgba(115, 210, 141, 0.12)"
                    : "rgba(46, 125, 50, 0.1)",
                },
              },
            },
          },
          MuiDialog: {
            styleOverrides: {
              paper: {
                borderRadius: 20,
                backgroundImage: "none",
              },
            },
          },
          MuiSelect: {
            styleOverrides: {
              root: {
                borderRadius: 12,
              },
            },
          },
        },
      }),
    [theme]
  );

  return (
    <MuiTP theme={muiTheme}>
      <CssBaseline enableColorScheme />
      {children}
    </MuiTP>
  );
}
