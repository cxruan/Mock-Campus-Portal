import React from 'react';
import { SnackbarProvider } from 'notistack';
import axios from 'axios';
import Cookie from 'cookie-universal';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { red, orange } from '@material-ui/core/colors';

import { sleep } from './utils';
import AppPages from './pages/AppPages';
import Loading from './pages/Loading';
import SignIn from './pages/SignIn';

axios.defaults.withCredentials = true;

const cookies = Cookie();

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#2c3e50'
    },
    secondary: {
      main: '#d35400'
    },
    orange: orange[600],
    red: red[500]
  },
  props: {
    MuiButtonBase: {
      disableRipple: true
    },
    transitions: {
      create: () => 'none'
    }
  }
});

export default function App() {
  const [isFetching, setIsFetching] = React.useState(true);
  const [loggedIn, setLoggedIn] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(handleAuthenticate, []);

  function handleLogin() {
    setIsFetching(false);
    setLoggedIn(true);
  }

  function handleLogout() {
    setIsFetching(false);
    setLoggedIn(false);
    cookies.remove('jwt');
  }

  function handleAuthenticate() {
    if (isLoading) {
      sleep(500)
        .then(() => axios.get('/api/authenticate'))
        .then(handleLogin)
        .catch(handleLogout);
    }
  }

  return (
    <SnackbarProvider maxSnack={3} autoHideDuration={2000} preventDuplicate>
      <MuiThemeProvider theme={theme}>
        {isFetching && <Loading />}
        {loggedIn && !isFetching && (
          <AppPages logOut={handleLogout} isLoading={isLoading} setIsLoading={setIsLoading} />
        )}
        {!loggedIn && !isFetching && <SignIn handleLogin={handleLogin} />}
      </MuiThemeProvider>
    </SnackbarProvider>
  );
}
