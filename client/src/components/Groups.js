import React, { useState, useEffect } from 'react';

function Groups() {
  // State variables for the "Create Group" form
  const [group_name, setGroupName] = useState('');

  // State variables for the "Add Group Members" form
  const [addGroupId, setAddGroupId] = useState('');
  const [user_names, setUserNames] = useState('');

  // State variable to store user groups
  const [userGroups, setUserGroups] = useState([]);

  // Function to handle changes in the group_name input
  const handleGroupNameChange = (e) => {
    setGroupName(e.target.value);
  };

  // Function to handle changes in the group_id input for adding group members
  const handleAddGroupIdChange = (e) => {
    setAddGroupId(e.target.value);
  };

  // Function to handle changes in the user_names input for adding group members
  const handleUserNamesChange = (e) => {
    setUserNames(e.target.value);
  };

  // Function to fetch user groups and update the state
  const fetchUserGroups = () => {
    const user_id = sessionStorage.getItem('user_id'); // Get the user_id from session storage
    fetch(`/api/groups?user_id=${user_id}`)
      .then((response) => response.json())
      .then((data) => {
        setUserGroups(data);
      })
      .catch((error) => {
        console.error('Failed to retrieve user groups:', error);
      });
  };

  // Load user groups when the component mounts
  useEffect(() => {
    fetchUserGroups();
  }, []);

  // Function to create a group
  const handleCreateGroup = () => {
    const user_id = sessionStorage.getItem('user_id'); // Get the user_id from session storage
    fetch('/api/groups', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: user_id,
        group_name: group_name,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.group_id) {
          fetch('/api/usergroups', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user_id: user_id,
              group_id: data.group_id,
            }),
          })
            .then(() => {
              setGroupName('');
              fetchUserGroups(); // Update the user groups list after creating the group
            })
            .catch((error) => {
              console.error('Failed to add user to group:', error);
            });
        }
      })
      .catch((error) => {
        console.error('Failed to create a group:', error);
      });
  };
// Function to add group members
const handleAddGroupMembers = () => {
  const currentUserId = sessionStorage.getItem('user_id'); // Get the user_id from session storage

  // Fetch the user_id associated with the provided user_name
  fetch(`/api/users?user_name=${user_names}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.user_id) {
        // Use the fetched user_id to add the group member
        fetch('/api/usergroups', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: currentUserId, // Use the current user's user_id
            group_id: addGroupId,
            user_names: user_names,
          }),
        })
          .then(() => {
            setAddGroupId('');
            setUserNames('');
            fetchUserGroups(); // Update the user groups list after adding members
          })
          .catch((error) => {
            console.error('Failed to add group members:', error);
          });
      } else {
        console.error('User not found');
      }
    })
    .catch((error) => {
      console.error('Failed to fetch user:', error);
    });
};



  return (
    <div>
      <h1>Groups</h1>
      <p>This is where users can create new groups and add the user_ids in the input fields of the users they would like to add to the group.</p>

      {/* Create Group Form */}
      <div>
        <h2>Create a New Group</h2>
        <label>Group Name:</label>
        <input type="text" value={group_name} onChange={handleGroupNameChange} />
        <button onClick={handleCreateGroup}>Create Group</button>
      </div>

      {/* Add Group Members Form */}
      <div>
        <h2>Add Group Members</h2>
        <label>Group ID:</label>
        <input type="text" value={addGroupId} onChange={handleAddGroupIdChange} />
        <label>User Names (comma-separated):</label>
        <input type="text" value={user_names} onChange={handleUserNamesChange} />
        <button onClick={handleAddGroupMembers}>Add Group Members</button>
      </div>

      {/* Display User Groups */}
      <div>
        <h2>View Groups Here</h2>
        <ul>
          {userGroups.map((group) => (
            <li key={group.group_id}>{`Group ID: ${group.group_id}, Group Name: ${group.group_name}`}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Groups;
