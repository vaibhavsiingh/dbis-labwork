import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom';

// Import required components
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Groups from './components/Groups';
import GroupDetails from './components/GroupDetails';
import Friends from './components/Friends';
import CreateGroup from './components/CreateGroup';

function App() {
  const navigate = useNavigate();

  // TODO: Maintain user authentication state
  // user should store logged-in user details
  // loading should indicate whether auth status is being checked
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const isAuthenticated = user !== null;
  // TODO: Implement authentication status check
  // On component mount:
  // 1. Make an API call to check if the user is logged in
  // 2. If logged in, store user data in state
  // 3. Stop the loading state
  useEffect(() => {
    const checkLoginStatus = async () => {
      // Implement API call here
      setLoading(true);
      const response = await fetch('http://localhost:4000/isLoggedIn',{
        credentials: 'include'
      });
      const data = await response.json();
      if (data.loggedIn){
        setUser(data.user);
      }      
      setLoading(false);
    };

    checkLoginStatus();
  }, []);

  // TODO: Handle successful login
  // This function should:
  // 1. Update user state
  // 2. Redirect to dashboard
  const handleLogin = (userData) => {
    console.log(userData);
    setUser(userData);  
    navigate('/');
  };

  // TODO: Handle logout functionality
  // This function should:
  // 1. Call logout API
  // 2. Clear user state
  // 3. Redirect to login page
  const handleLogout = async () => {
    await fetch('http://localhost:4000/logout', {
      method: 'POST',
      credentials: 'include'
    });
    setUser(null);
    navigate('/login');
  };

  // TODO: Show a loading indicator while authentication is being checked
  if (loading) {
    return <div>i am loading bitch</div>;
  }


  return (
    <div className="app">
      {/* TODO: Show navigation bar only when user is logged in */}
      {user && (
        <nav className="container">
          <div className="logo">
            {/* Display application name and username */}
          </div>

          <div className="nav-links">
            {/* TODO: Add navigation links */}
            {/* Dashboard, Groups, Friends */}
            {/* Add logout button */}
          </div>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </nav>
      )}

      <div className="container">
        {/* TODO: Configure application routes */}
        <Routes>
          {/* Login route (only accessible when logged out) */}
          <Route path="/login" element={
            /* Implement conditional routing here */
            <Login onLogin={handleLogin}/>
          } />

          {/* Protected routes (only accessible when logged in) */}
          <Route
      path="/"
      element={
        isAuthenticated
          ? <Dashboard user={user} />
          : <Navigate to="/login" replace />
      }
    />

    <Route
      path="/groups"
      element={
        isAuthenticated
          ? <Groups />
          : <Navigate to="/login" replace />
      }
    />

    <Route
      path="/groups/create"
      element={
        isAuthenticated
          ? <CreateGroup />
          : <Navigate to="/login" replace />
      }
    />

    <Route
      path="/group/:id"
      element={
        isAuthenticated
          ? <GroupDetails user={user} />
          : <Navigate to="/login" replace />
      }
    />

    <Route
      path="/friends"
      element={
        isAuthenticated
          ? <Friends />
          : <Navigate to="/login" replace />
      }
    />
        </Routes>
      </div>
    </div>
  );
}

export default App;
