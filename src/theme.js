import { createTheme } from '@mui/material/styles';

export const getTheme = (isDark) =>
  createTheme({
    palette: {
      mode: isDark ? 'dark' : 'light',
      primary: {
        main: '#2563ff',
      },
      background: {
        default: isDark ? '#181a27' : '#f9f9f9',
        paper: isDark ? '#232946' : '#fff',
      },
    },
    components: {
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundImage: 'none',
          },
        },
      },
    },
  }); 