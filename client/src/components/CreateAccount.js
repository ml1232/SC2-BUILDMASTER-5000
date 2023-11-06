import React, { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';

function CreateAccount() {
  // State to store user input
  const [formData, setFormData] = useState({
    user_name: '',
    email: '',
    password: '',
  });

  // State to manage the success message
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Access the history object from React Router
  const history = useHistory();

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Send a POST request to the server to register the user with the hashed password
    fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...formData }), // Send the hashed password
    })
      .then((response) => {
        if (response.status === 201) {
          console.log('User registered successfully');
          setRegistrationSuccess(true); // Set success message
        } else if (response.status === 400) {
          console.log('Missing required fields');
          // Handle validation errors or show a message to the user
        }
      })
      .catch((error) => {
        console.error('Registration failed:', error);
        // Handle any other error scenarios
      });
  };

  // Use useEffect to redirect after showing the success message
  useEffect(() => {
    if (registrationSuccess) {
      setTimeout(() => {
        // Redirect to the Sign In page after a successful registration
        history.push('/signin');
      }, 3000); // Redirect after 3 seconds
    }
  }, [registrationSuccess, history]);

  return (
    <div className="top-right-bottom-links">
      {registrationSuccess ? (
        <div>
          <p>User registered successfully</p>
          <p>Redirecting to Sign In page...</p>
        </div>
      ) : (
        <div>
          <h1>Create Account</h1>
          <p>This is the create account portal of your application.</p>
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
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
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
            <button type="submit">Register</button>
          </form>
          <Link to="/signin">Already have an account?</Link>
        </div>
      )}
    </div>
  );
}

export default CreateAccount;
