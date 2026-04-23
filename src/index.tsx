import React from 'react';
import App from './App';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { Buffer } from 'buffer';
import { createRoot } from 'react-dom/client';
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';

const hubraTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: { main: '#F5C518', contrastText: '#0b1020' },
        secondary: { main: '#395DF0', contrastText: '#fff' },
        success: { main: '#0CDAC4', contrastText: '#0b1020' },
        warning: { main: '#FF845A', contrastText: '#0b1020' },
        error: { main: '#FF5A7A' },
        background: { default: '#0b1020', paper: 'rgba(16, 22, 46, 0.72)' },
        divider: 'rgba(255, 255, 255, 0.08)',
        text: { primary: '#F5F6FB', secondary: 'rgba(245, 246, 251, 0.68)' },
    },
    shape: { borderRadius: 14 },
    typography: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif',
        h1: { fontSize: 34, fontWeight: 700, letterSpacing: '-0.02em' },
        button: { textTransform: 'none', fontWeight: 600, letterSpacing: 0 },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: { backgroundColor: '#0b1020' },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: { backgroundImage: 'none' },
            },
        },
        MuiButton: {
            defaultProps: { disableElevation: true },
            styleOverrides: {
                root: {
                    borderRadius: 999,
                    paddingInline: 22,
                    paddingBlock: 10,
                    fontSize: 15,
                    transition: 'transform 160ms ease, box-shadow 160ms ease, filter 160ms ease',
                    '&:hover': { transform: 'translateY(-1px)' },
                    '&.Mui-disabled': { opacity: 0.45 },
                },
                containedPrimary: {
                    boxShadow: '0 10px 28px rgba(245, 197, 24, 0.32)',
                    '&:hover': { boxShadow: '0 14px 34px rgba(245, 197, 24, 0.5)' },
                },
                containedSecondary: {
                    boxShadow: '0 10px 28px rgba(57, 93, 240, 0.35)',
                    '&:hover': { boxShadow: '0 14px 34px rgba(57, 93, 240, 0.55)' },
                },
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.12)' },
                    '&:hover fieldset': { borderColor: 'rgba(245, 197, 24, 0.4)' },
                    '&.Mui-focused fieldset': { borderColor: '#F5C518', borderWidth: 1 },
                },
                input: { padding: '14px 16px', fontSize: 15 },
            },
        },
        MuiAlert: {
            styleOverrides: {
                root: { borderRadius: 12, backdropFilter: 'blur(8px)' },
            },
        },
        MuiSnackbar: {
            styleOverrides: {
                root: { '& .MuiAlert-root': { minWidth: 280 } },
            },
        },
    },
});
(window as any).global = window;
(window as any).global.Buffer = Buffer;
(window as any).process = {
    version: '',
    node: false,
    env: false,
};


const container:HTMLElement | any = document.getElementById('root');
const root = createRoot(container); // createRoot(container!) if you use TypeScript
root.render(
    <ThemeProvider theme={hubraTheme}>
        <CssBaseline />
        <App />
    </ThemeProvider>
);



// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
