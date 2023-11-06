import React, { useState, useEffect } from 'react';

function Notes() {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState({
    build_id: '',
    note: '',
  });
  const [buildId, setBuildId] = useState('');
  const [notesByBuildId, setNotesByBuildId] = useState([]);
  const [editNote, setEditNote] = useState(null); // State to manage the note to be edited

  const handleGetNotes = () => {
    // Make a GET request to retrieve the user's notes
    fetch(`/api/usernotes?user_id=${sessionStorage.getItem('user_id')}`)
      .then((response) => response.json())
      .then((data) => {
        setNotes(data);
      })
      .catch((error) => {
        console.error('Failed to retrieve notes:', error);
      });
  };

  const handleAddNote = () => {
    // Make a POST request to add a new note
    const user_id = sessionStorage.getItem('user_id');
    const build_id = newNote.build_id;
    const note = newNote.note;

    const noteData = {
      build_id,
      note,
      user_id,
    };

    fetch('/api/usernotes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(noteData),
    })
      .then((response) => response.json())
      .then(() => {
        setNewNote({
          build_id: '',
          note: '',
        });
        handleGetNotes();
      })
      .catch((error) => {
        console.error('Failed to add a note:', error);
      });
  };

  const handleGetNotesByBuildId = () => {
    // Make a GET request to retrieve notes by Build ID
    fetch(`/api/usernotes/${buildId}`)
      .then((response) => response.json())
      .then((data) => {
        setNotesByBuildId(data);
      })
      .catch((error) => {
        console.error('Failed to retrieve notes by Build ID:', error);
      });
  };

  const handleEditNote = (note) => {
    setEditNote(note);
  };

  const handleUpdateNote = () => {
    // Make a PUT request to update the note with the updated data
    fetch(`/api/usernotes/${editNote.note_id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(editNote),
    })
      .then((response) => response.json())
      .then(() => {
        // Close the edit form
        setEditNote(null);
        // Refresh the notes list
        handleGetNotesByBuildId();
      })
      .catch((error) => {
        console.error('Failed to update note:', error);
      });
  };

  const handleDeleteNote = (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      // Make a DELETE request to delete the note
      fetch(`/api/usernotes/${noteId}`, {
        method: 'DELETE',
      })
        .then(() => {
          // Refresh the notes list after successful deletion
          handleGetNotesByBuildId();
        })
        .catch((error) => {
          console.error('Failed to delete note:', error);
        });
    }
  };

  useEffect(() => {
    handleGetNotes();
  }, []);

  return (
    <div>
      <h1>Notes</h1>
      <p>This is where you can add, view, edit, and delete notes.</p>

      <div>
        <h2>Add New Note Here</h2>
        <label>Build ID:</label>
        <input type="text" value={newNote.build_id} onChange={(e) => setNewNote({ ...newNote, build_id: e.target.value })} />
        <label>Note:</label>
        <input type="text" value={newNote.note} onChange={(e) => setNewNote({ ...newNote, note: e.target.value })} />
        <button onClick={handleAddNote}>Submit Note</button>
      </div>

      <div>
        <h2>Get Notes by Build ID</h2>
        <label>Build ID:</label>
        <input type="text" value={buildId} onChange={(e) => setBuildId(e.target.value)} />
        <button onClick={handleGetNotesByBuildId}>Get Notes by Build ID</button>
      </div>

      {notesByBuildId.length > 0 && (
        <div>
          <h2>Notes List</h2>
          <ul>
            {notesByBuildId.map((note) => (
              <li key={note.note_id}>
                Note ID: {note.note_id}, Build ID: {note.build_id}, Note: {note.note}
                <button onClick={() => handleEditNote(note)}>Edit</button>
                <button onClick={() => handleDeleteNote(note.note_id)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {editNote && (
        <div>
          <h2>Edit Note</h2>
          <label>Note:</label>
          <input
            type="text"
            value={editNote.note}
            onChange={(e) => setEditNote({ ...editNote, note: e.target.value })}
          />
          <button onClick={handleUpdateNote}>Update Note</button>
        </div>
      )}
    </div>
  );
}

export default Notes;
