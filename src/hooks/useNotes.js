import { useState, useEffect } from 'react';
import { notesAPI } from '../api/notes.js';

export function useNotes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const fetchedNotes = await notesAPI.getNotes();
      setNotes(fetchedNotes);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createNote = async (noteData) => {
    try {
      const newNote = await notesAPI.createNote(noteData);
      setNotes([newNote, ...notes]);
      return newNote;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateNote = async (noteId, noteData) => {
    try {
      const updatedNote = await notesAPI.updateNote(noteId, noteData);
      setNotes(notes.map(note => 
        note.id === noteId ? updatedNote : note
      ));
      return updatedNote;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteNote = async (noteId) => {
    try {
      await notesAPI.deleteNote(noteId);
      setNotes(notes.filter(note => note.id !== noteId));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const searchNotes = async (query) => {
    try {
      setLoading(true);
      const searchResults = await notesAPI.searchNotes(query);
      setNotes(searchResults);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  return {
    notes,
    loading,
    error,
    createNote,
    updateNote,
    deleteNote,
    searchNotes,
    refetch: fetchNotes
  };
}

export function useTags() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const fetchedTags = await notesAPI.getTags();
      setTags(fetchedTags);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  return {
    tags,
    loading,
    error,
    refetch: fetchTags
  };
}
