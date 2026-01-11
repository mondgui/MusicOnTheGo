import { useMemo } from "react";
import { createTheme } from "@mui/material/styles";

// Color design tokens (light mode only)
export const tokens = {
    grey: {
        100: "#ffffff",
        200: "#f5f5f5",
        300: "#e0e0e0",
        400: "#bdbdbd",
        500: "#9e9e9e",
        600: "#757575",
        700: "#616161",
        800: "#424242",
        900: "#212121",
    },
    
    primary: {
        100: "#ffffff",
        200: "#f5f5f5",
        300: "#e8eaf6",
        400: "#c5cae9",
        500: "#9fa8da",
        600: "#7986cb",
        700: "#5c6bc0",
        800: "#3f51b5",
        900: "#303f9f",
    },
    greenAccent: {
        100: "#e8f5e9",
        200: "#c8e6c9",
        300: "#a5d6a7",
        400: "#81c784",
        500: "#66bb6a",
        600: "#4caf50",
        700: "#43a047",
        800: "#388e3c",
        900: "#2e7d32",
    },
    
    redAccent: {
        100: "#ffebee",
        200: "#ffcdd2",
        300: "#ef9a9a",
        400: "#e57373",
        500: "#ef5350",
        600: "#e53935",
        700: "#d32f2f",
        800: "#c62828",
        900: "#b71c1c",
    },
    
    blueAccent: {
        100: "#e3f2fd",
        200: "#bbdefb",
        300: "#90caf9",
        400: "#64b5f6",
        500: "#42a5f5",
        600: "#2196f3",
        700: "#1e88e5",
        800: "#1976d2",
        900: "#1565c0",
    },
};

// MUI theme settings (light mode only)
export const themeSettings = () => {
    const colors = tokens;
    return {
        palette: {
            mode: "light",
            primary: {
                main: colors.primary[500],
            },
            secondary: {
                main: colors.greenAccent[600],
            },
            neutral: {
                dark: colors.grey[700],
                main: colors.grey[500],
                light: colors.grey[100],
            },
            background: {
                default: "#ffffff",
                alt: colors.grey[200],
            },
        },
        typography: {
            fontFamily: ["Source Sans 3", "sans-serif"].join(","),
            fontSize: 12,
            h1: {
                fontFamily: ["Source Sans 3", "sans-serif"].join(","),
                fontSize: 40,
            },
            h2: {
                fontFamily: ["Source Sans 3", "sans-serif"].join(","),
                fontSize: 32,
            },
            h3: {
                fontFamily: ["Source Sans 3", "sans-serif"].join(","),
                fontSize: 24,
            },
            h4: {
                fontFamily: ["Source Sans 3", "sans-serif"].join(","),
                fontSize: 20,
            },
            h5: {
                fontFamily: ["Source Sans 3", "sans-serif"].join(","),
                fontSize: 16,
            },
            h6: {
                fontFamily: ["Source Sans 3", "sans-serif"].join(","),
                fontSize: 14,
            },
            subtitle1: {
                fontFamily: ["Source Sans 3", "sans-serif"].join(","),
                fontSize: 16,
            },
        },
    };
};

// Create theme (light mode only)
export const useTheme = () => {
    const theme = useMemo(() => createTheme(themeSettings()), []);
    return theme;
};