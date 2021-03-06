import Login from '@components/auth/Login';
import GlobalStyle from '@components/styling/GlobalStyle';
import LandingPage from '@components/Landing/LandingPageMui';
import { BrowserRouter, Redirect, Route } from 'react-router-dom';
import './styling/App.scss';

/** ROUTES */

function PublicRoute({ RouteComponent, ...rest }) {
  const isAuthenticated = false;
  return (
    <Route
      render={props =>
        isAuthenticated ? <Redirect to="/home" /> : <RouteComponent {...props} />}
      {...rest}
    />
  );
}

function PrivateRoute({ RouteComponent, ...rest }) {
  const isAuthenticated = false;
  return (
    <Route
      render={props =>
        isAuthenticated ? <RouteComponent {...props} /> : <Redirect to="/login" />}
      {...rest}
    />
  );
}

/** APP */

function App() {
  return (
    <div>
      <GlobalStyle />
      <BrowserRouter>
        <PublicRoute path="/login" component={Login} />
        {/* <PublicRoute path="/register" component={Register} /> */}
        <PrivateRoute exact path="/" component={LandingPage} />
      </BrowserRouter>
    </div>
  );
}

export default App;
