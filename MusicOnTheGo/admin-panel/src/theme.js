import { createContext, useState, useMemo } from "react";
import { createTheme } from "@mui/material/styles";

// Color design tokens
export const tokens = (mode) => ({
    ...(mode === "dark"
        ? {
            grey: {
                100: "#e0e0e0",
                200: "#b3b3b3",
                300: "#808080",
                400: "#4d4d4d",
                500: "#1a1a1a",
                600: "#141b2d",
                700: "#0e121f",
                800: "#07090f",
                900: "#030407",
            },
            
            primary: {
                100: "#d0d1d5",
                200: "#a1a4ab",
                300: "#727781",
                400: "#434a4b",
                500: "#141b2d",
                600: "#10151e",
                700: "#0b0e15",
                800: "#05070a",
                900: "#020305",
            },
            greenAccent: {
                100: "#e0e0e0",
                200: "#b3b3b3",
                300: "#808080",
                400: "#4d4d4d",
                500: "#1a1a1a",
                600: "#141b2d",
                700: "#0e121f",
                800: "#07090f",
                900: "#030407",
            },
            
            redAccent: {
                100: "#e0e0e0",
                200: "#b3b3b3",
                300: "#808080",
                400: "#4d4d4d",
                500: "#1a1a1a",
                600: "#141b2d",
                700: "#0e121f",
                800: "#07090f",
                900: "#030407",
            },
            
            blueAccent: {
                100: "#e0e0e0",
                200: "#b3b3b3",
                300: "#808080",
                400: "#4d4d4d",
                500: "#1a1a1a",
                600: "#141b2d",
                700: "#0e121f",
                800: "#07090f",
                900: "#030407",
            },
            
        }
        : {
            // Light mode - lighter colors for backgrounds, darker for text
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
            
        }),
    
});


// MUI theme settings
export const themeSettings = (mode) => {
    const colors = tokens(mode);
    return {
        palette: {
            mode: mode,
            ...(mode === "dark" ? {
                primary: {
                    main: colors.primary[500],
                },
                secondary: {
                    main: colors.greenAccent[500],
                },
                neutral: {
                    dark: colors.grey[700],
                    main: colors.grey[500],
                    light: colors.grey[100],
                },
                background: {
                    default: colors.primary[500],
                    alt: colors.grey[800],
                },
            } : {
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
            }),
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

// Context for color mode
export const ColorModeContext = createContext({
    toggleColorMode: () => {},
    mode: "light",
});

export const useMode = () => {
    const [mode, setMode] = useState("dark");

    const colorMode = useMemo(() => ({
        toggleColorMode: () => {
            setMode((prev) => (prev === "light" ? "dark" : "light"));
        },
        mode: mode,
    }), [mode]);

    // Context for theme
    const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);
    return [theme, colorMode];
};