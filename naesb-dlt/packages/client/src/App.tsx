import { useEffect } from 'react';
import { Box, CssBaseline } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Switch, Route, Redirect } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { ThemeProvider } from '@common/theme';
import { Header } from '@common/header';
import { Home } from '@pages/home';
import { Channels } from '@pages/channels';
import { useAuth0 } from '@auth0/auth0-react';
import { Explorer } from '@pages/explorer';
import { Deliveries } from '@pages/deliveries';
import { Trades } from '@pages/trades';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { ProtectedRoute } from '@common/route/Protected';
import { Invoices } from '@pages/invoices';
import { Organization } from '@pages/organization';

const App = () => {
  useEffect(() => {
    AOS.init();
    AOS.refresh();
  }, []);
  const { isAuthenticated } = useAuth0();
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <ThemeProvider mode="dark">
        <CssBaseline />
        <Box
          display="flex"
          flexDirection="column"
          position="relative"
          height="100vh"
        >
          <Header />
          <Switch>
            {isAuthenticated && <Redirect from="/" to="/channels" exact />}
            <Route path="/" exact>
              <Home />
            </Route>
            <ProtectedRoute component={Channels} path="/channels" />
            <ProtectedRoute component={Deliveries} path="/deliveries" />
            <ProtectedRoute component={Explorer} path="/ledger" />
            <ProtectedRoute component={Trades} path="/trades" />
            <ProtectedRoute component={Invoices} path="/invoices" />
            <ProtectedRoute component={Organization} path="/organization" />
          </Switch>
        </Box>
      </ThemeProvider>
    </LocalizationProvider>
  );
};

export default App;
