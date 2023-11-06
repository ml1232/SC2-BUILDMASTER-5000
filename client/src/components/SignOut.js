import React, { useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';

function SignOut() {
  const history = useHistory();

  useEffect(() => {
    // Make a GET request to the sign-out endpoint on your server
    fetch('/api/signout', {
      method: 'GET',
    })
      .then((response) => {
        if (response.status === 200) {
          // Sign-out successful on the server
          history.push('/signin'); // Redirect to the sign-in page
        }
      })
      .catch((error) => {
        console.error('Sign out failed:', error);
      });
  }, [history]);

  return (
    <div>
      <p>Signing out...</p>
      {/* You can display a loading message or spinner here */}
    </div>
  );
}

export default SignOut;
