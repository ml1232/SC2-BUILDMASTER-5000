import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import Builds from './components/Builds';
import Results from './components/Results';
import Groups from './components/Groups';
import Notes from './components/Notes';
import SignIn from './components/SignIn';
import CreateAccount from './components/CreateAccount';
import NavBar from './components/NavBar';
import './index.css';
import { Link } from 'react-router-dom';
import Profile from './components/Profile';
import SignOut from './components/SignOut';
import { AuthProvider } from './components/AuthContext';



function App() {
  return (
    <Router>
      <AuthProvider>
        <div>
          <header className="header">
            <h1>Welcome to the StratMaster SC2 BuildHub 5000!</h1>
            <h2>"Your personal command center to track your builds and optimize your SC2 gameplay"</h2>
            <Link to="/signout">Sign Out</Link> {/* Updated to /signout */}
            <Link to="/profile">Profile</Link>
          </header>
          <nav className="navbar">
            <Link to="/builds" className="nav-link">Builds</Link>
            <Link to="/results" className="nav-link">Results</Link>
            <Link to="/groups" className="nav-link">Groups</Link>
            <Link to="/notes" className="nav-link">Notes</Link>
          </nav>
          <div className="container">
            <NavBar />
            <Switch>
              <Redirect exact from="/" to="/signin" />
              <Route path="/signin" component={SignIn} />
              <Route path="/createaccount" component={CreateAccount} />
              <Route path="/builds" component={Builds} />
              <Route path="/results" component={Results} />
              <Route path="/groups" component={Groups} />
              <Route path="/notes" component={Notes} />
              <Route path="/profile" component={Profile} />
              <Route path="/signout" component={SignOut} />
            </Switch>
          </div>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
