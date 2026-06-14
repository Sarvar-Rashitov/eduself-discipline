import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent } from '../components/ui/dialog';
import { Plus, Pin, Trash2, Search, Maximize2 } from 'lucide-react';
import Masonry from 'react-responsive-masonry';
import { Note } from '../lib/storage';
import { toast } from 'sonner';

const NOTE_COLORS = [
  '#FFFFFF', // White
  '#FEF3C7', // Yellow
  '#DBEAFE', // Blue
  '#D1FAE5', // Green
  '#FCE7F3', // Pink
  '#E9D5FF', // Purple
  '#FED7AA', // Orange
  '#D1D5DB', // Gray
];

export const Notes: React.FC = () => {
  const { notes, setNotes } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [focusNote, setFocusNote] = useState<Note | null>(null);
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleCreateNote = () => {
    const note: Note = {
      id: crypto.randomUUID(),
      title: 'Untitled',
      content: '',
      color: NOTE_COLORS[0],
      tags: [],
      pinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setNotes([note, ...notes]);
    setFocusNote(note);
  };

  const handleUpdateNote = (id: string, updates: Partial<Note>) => {
    setNotes(
      notes.map(n => n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n)
    );
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
    if (focusNote?.id === id) {
      setFocusNote(null);
    }
    toast.success('Note deleted');
  };

  const handleTogglePin = (id: string) => {
    setNotes(
      notes.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n)
    );
  };

  const handleContentChange = (id: string, content: string) => {
    setNotes(
      notes.map(n => n.id === id ? { ...n, content, updatedAt: new Date().toISOString() } : n)
    );

    // Auto-save after 2 seconds of inactivity
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    autoSaveTimerRef.current = setTimeout(() => {
      toast.success('Auto-saved', { duration: 1000 });
    }, 2000);
  };

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const pinnedNotes = filteredNotes.filter(n => n.pinned);
  const unpinnedNotes = filteredNotes.filter(n => !n.pinned);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Notes</h1>
          <p className="text-muted-foreground">Capture your thoughts</p>
        </div>
        <Button onClick={handleCreateNote} className="gap-2">
          <Plus className="h-5 w-5" />
          New Note
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes..."
            className="pl-10"
          />
        </div>
      </div>

      {notes.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="font-bold text-lg mb-2">No notes yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first note to start writing
          </p>
          <Button onClick={handleCreateNote}>
            Create Note
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {pinnedNotes.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <Pin className="h-4 w-4" />
                Pinned
              </h2>
              <Masonry columnsCount={3} gutter="16px">
                {pinnedNotes.map((note) => (
                  <Card
                    key={note.id}
                    className="p-4 cursor-pointer hover:shadow-lg transition-shadow relative group"
                    style={{ backgroundColor: note.color }}
                    onClick={() => setFocusNote(note)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold">{note.title}</h3>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTogglePin(note.id);
                          }}
                        >
                          <Pin className="h-4 w-4 fill-current" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNote(note.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-6 whitespace-pre-wrap">
                      {note.content}
                    </p>
                    {note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {note.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs bg-black/10 px-2 py-0.5 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </Card>
                ))}
              </Masonry>
            </div>
          )}

          {unpinnedNotes.length > 0 && (
            <div>
              {pinnedNotes.length > 0 && (
                <h2 className="text-sm font-medium text-muted-foreground mb-3">
                  Other Notes
                </h2>
              )}
              <Masonry columnsCount={3} gutter="16px">
                {unpinnedNotes.map((note) => (
                  <Card
                    key={note.id}
                    className="p-4 cursor-pointer hover:shadow-lg transition-shadow relative group"
                    style={{ backgroundColor: note.color }}
                    onClick={() => setFocusNote(note)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold">{note.title}</h3>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTogglePin(note.id);
                          }}
                        >
                          <Pin className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNote(note.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-6 whitespace-pre-wrap">
                      {note.content}
                    </p>
                    {note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {note.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs bg-black/10 px-2 py-0.5 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </Card>
                ))}
              </Masonry>
            </div>
          )}
        </div>
      )}

      {/* Focus Mode Dialog */}
      <Dialog open={focusNote !== null} onOpenChange={() => setFocusNote(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          {focusNote && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Input
                  value={focusNote.title}
                  onChange={(e) => handleUpdateNote(focusNote.id, { title: e.target.value })}
                  className="text-2xl font-bold border-none shadow-none focus-visible:ring-0"
                />
                <div className="flex gap-1">
                  <Button
                    variant={focusNote.pinned ? 'default' : 'ghost'}
                    size="icon"
                    onClick={() => handleTogglePin(focusNote.id)}
                  >
                    <Pin className={`h-4 w-4 ${focusNote.pinned ? 'fill-current' : ''}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteNote(focusNote.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <textarea
                value={focusNote.content}
                onChange={(e) => handleContentChange(focusNote.id, e.target.value)}
                placeholder="Start writing..."
                className="w-full min-h-[400px] p-4 rounded-lg border bg-transparent resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              />

              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  {NOTE_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleUpdateNote(focusNote.id, { color })}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        focusNote.color === color ? 'border-primary ring-2 ring-primary' : 'border-border'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>

                <Input
                  placeholder="Add tags (comma-separated)"
                  onChange={(e) => handleUpdateNote(focusNote.id, {
                    tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                  })}
                  className="flex-1"
                />
              </div>

              <div className="text-xs text-muted-foreground">
                Last edited: {new Date(focusNote.updatedAt).toLocaleString()}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
