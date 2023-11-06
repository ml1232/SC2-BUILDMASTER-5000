import React, { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useAuth } from './AuthContext'; // Import the useAuth hook

function SignIn() {
  // State to store user input
  const [formData, setFormData] = useState({
    user_name: '',
    password: '',
  });

  // State to store success message and user name
  const [signInMessage, setSignInMessage] = useState('');

  // Access the history object from React Router
  const history = useHistory();

  const { login } = useAuth(); // Access the login function from the context

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Send a POST request to the server to verify the user's credentials
    fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        } else if (response.status === 401) {
          return null;
        }
      })
      .then((data) => {
        if (data) {
          console.log(`Sign in successful, welcome ${data.user_name}`);
          // Call the login function to set the user context
          login(data);

          // Set the user_id in sessionStorage
          sessionStorage.setItem('user_id', data.user_id);

          setSignInMessage(`Sign in successful, welcome ${data.user_name}`);
          setTimeout(() => {
            history.push('/builds');
          }, 2000);
        } else {
          setSignInMessage('Sign in failed. Please check your credentials.');
        }
      })
      .catch((error) => {
        console.error('Sign in failed:', error);
      });
  }

  // Use useEffect to redirect after showing the success message
  useEffect(() => {
    if (signInMessage.includes('Sign in successful')) {
      setTimeout(() => {
        history.push('/builds'); // Redirect after 3 seconds
      }, 3000);
    }
  }, [signInMessage, history]);

  return (
    <div className="top-right-bottom-links">
      <h1>Sign In</h1>
      <p>This is the sign-in portal of your application.</p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="user_name">Username</label>
          <input
            type="text"
            id="user_name"
            name="user_name"
            value={formData.user_name}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>
        <button type="submit">Sign In</button>
      </form>
      {signInMessage && <p>{signInMessage}</p>}
      <Link to="/createaccount">Don't have an account?</Link>
    </div>
  );
}

export default SignIn;
