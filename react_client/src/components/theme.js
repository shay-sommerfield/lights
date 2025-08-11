import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#e5989b',
      light: '#ffb4a2',
      dark: '#b5838d',
      contrastText: '#6d6875',
    },
    secondary: {
      main: '#ffcdb2',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: ({ theme }) => ({
            fontFamily: '"Abril Fatface", serif',
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
              color: theme.palette.secondary.main
            },
          }),
    },
}
}});

export default theme;