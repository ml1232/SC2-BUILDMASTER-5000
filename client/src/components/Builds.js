import React, { useState, useEffect } from 'react';

function Builds() {
  const [builds, setBuilds] = useState([]);
  const [newBuild, setNewBuild] = useState({
    build_name: '',
    matchup: '',
    category: '',
    build_order: '',
  });
  const [editBuild, setEditBuild] = useState(null); // State to manage the build to be edited

  const handleGetBuilds = () => {
    // Make a GET request to retrieve the user's builds
    fetch(`/api/builds?user_id=${sessionStorage.getItem('user_id')}`)
      .then((response) => response.json())
      .then((data) => {
        setBuilds(data);
      })
      .catch((error) => {
        console.error('Failed to retrieve builds:', error);
      });
  };

  const handleAddBuild = () => {
    // Make a POST request to add a new build
    const user_id = sessionStorage.getItem('user_id');
    const buildData = { ...newBuild, user_id };

    fetch('/api/builds', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(buildData),
    })
      .then((response) => response.json())
      .then(() => {
        // After successfully adding a build, clear the newBuild state
        setNewBuild({
          build_name: '',
          matchup: '',
          category: '',
          build_order: '',
        });
        // Refresh the builds list
        handleGetBuilds();
      })
      .catch((error) => {
        console.error('Failed to add a build:', error);
      });
  };

  const handleEditBuild = (build) => {
    setEditBuild(build);
  };

  const handleUpdateBuild = () => {
    // Make a PUT request to update the build with the updated data
    fetch(`/api/builds/${editBuild.build_id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(editBuild),
    })
      .then((response) => response.json())
      .then(() => {
        // Close the edit form
        setEditBuild(null);
        // Refresh the builds list
        handleGetBuilds();
      })
      .catch((error) => {
        console.error('Failed to update build:', error);
      });
  };

  const handleDeleteBuild = (buildId) => {
    if (window.confirm('Are you sure you want to delete this build?')) {
      // Make a DELETE request to delete the build
      fetch(`/api/builds/${buildId}`, {
        method: 'DELETE',
      })
        .then(() => {
          // Refresh the builds list after successful deletion
          handleGetBuilds();
        })
        .catch((error) => {
          console.error('Failed to delete build:', error);
        });
    }
  };

  useEffect(() => {
    handleGetBuilds();
  }, []); // Load builds when the component mounts

  return (
    <div>
      <h1>Builds Page</h1>
      <p>Add, View, and Edit the Builds you would like to start tracking below!</p>

      <div>
        <h2>Add New Build Here</h2>
        {/* Add Build Form */}
        <label>Build Name:</label>
        <input
          type="text"
          value={newBuild.build_name}
          onChange={(e) =>
            setNewBuild({ ...newBuild, build_name: e.target.value })
          }
        />
        <label>Matchup:</label>
        <input
          type="text"
          value={newBuild.matchup}
          onChange={(e) =>
            setNewBuild({ ...newBuild, matchup: e.target.value })
          }
        />
        <label>Category:</label>
        <input
          type="text"
          value={newBuild.category}
          onChange={(e) =>
            setNewBuild({ ...newBuild, category: e.target.value })
          }
        />
        <label>Build Order:</label>
        <input
          type="text"
          value={newBuild.build_order}
          onChange={(e) =>
            setNewBuild({ ...newBuild, build_order: e.target.value })
          }
        />
        <button onClick={handleAddBuild}>Submit Build</button>
      </div>

      <div>
        <h2>View Builds Here</h2>
        <button onClick={handleGetBuilds}>Get Builds</button>
      </div>

      <div>
        <h2>Builds List</h2>
        <ul>
          {builds.map((build) => (
            <li key={build.build_id}>
              Build ID: {build.build_id}, Build Name: {build.build_name}, Matchup: {build.matchup}, Category: {build.category}, Build Order: {build.build_order}
              <button onClick={() => handleEditBuild(build)}>Edit</button>
              <button onClick={() => handleDeleteBuild(build.build_id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>

      {editBuild && (
        <div>
          <h2>Edit Build</h2>
          <label>Build Name:</label>
          <input
            type="text"
            value={editBuild.build_name}
            onChange={(e) =>
              setEditBuild({ ...editBuild, build_name: e.target.value })
            }
          />
          <label>Matchup:</label>
          <input
            type="text"
            value={editBuild.matchup}
            onChange={(e) =>
              setEditBuild({ ...editBuild, matchup: e.target.value })
            }
          />
          <label>Category:</label>
          <input
            type="text"
            value={editBuild.category}
            onChange={(e) =>
              setEditBuild({ ...editBuild, category: e.target.value })
            }
          />
          <label>Build Order:</label>
          <input
            type="text"
            value={editBuild.build_order}
            onChange={(e) =>
              setEditBuild({ ...editBuild, build_order: e.target.value })
            }
          />
          <button onClick={handleUpdateBuild}>Update Build</button>
        </div>
      )}
    </div>
  );
}

export default Builds;
