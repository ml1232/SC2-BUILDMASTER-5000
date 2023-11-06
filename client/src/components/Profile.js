import React, { useState, useEffect } from 'react';

function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Make a request to get user information
    fetch('/api/user_info')
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        }
        throw new Error('Not logged in');
      })
      .then((data) => {
        setUser(data); // Update user state with user information
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  return (
    <div>
      {user ? (
        <div>
          <p>Welcome, {user.user_name}!</p>
          <p>Email: {user.email}</p>
          <p>User ID: {user.user_id}</p> {/* Display the user ID */}
          {/* Add more user information here */}
        </div>
      ) : (
        <p>Please sign in to see your profile.</p>
      )}
    </div>
  );
}

export default Profile;
