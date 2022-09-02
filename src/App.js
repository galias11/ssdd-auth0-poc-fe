import './App.css';
import createAuth0Client from '@auth0/auth0-spa-js';
import { useCallback, useEffect, useState } from 'react';

let auth0 = null;

const configureClient = async () => {
  auth0 = await createAuth0Client(require('./auth_config.json'));
}

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    configureClient()
      .then(() => {
        auth0.isAuthenticated()
          .then((status) => {
            setLoggedIn(status)
          });
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [setLoggedIn]);

  const handleSetToken = useCallback(async () => {
    const accessToken = await auth0?.getTokenSilently();
    setToken(accessToken);
  }, [])

  useEffect(() => {
    if(loggedIn) {
      handleSetToken()
    }
  }, [handleSetToken, loggedIn])

  const handleLogin = useCallback(() => {
    auth0?.loginWithPopup()
      .then(() => {
        setLoggedIn(true);
      });
  }, [setLoggedIn]);


  const handleLogout = useCallback(() => {
    auth0?.logout({
      returnTo: window.location.origin
    });
  }, []);

  if(loading) {
    return <div>Loading...</div>
  }

  if(error) {
    return <div>Error initializing</div>
  }

  return (
    <div className="App">
      <h2>SPA Authentication Sample</h2>
      <h3>Logging status: {loggedIn ? 'YES' : 'NO'}</h3>
      {loggedIn && <h4>{token}</h4>}
      <p>Welcome to our page!</p>
      <button id="btn-login" onClick={handleLogin}>Log in</button>
      <button id="btn-logout" onClick={handleLogout}>Log out</button>
      <button onClick={() =>
          fetch('http://localhost:3001/api/public')
          }>test public</button>
      <button onClick={() =>
          fetch('http://localhost:3001/api/private', { headers: { Authorization: `Bearer ${token}` } })
          }>test private</button>
    </div>
  );
}

export default App;
