import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Plus, MoreVertical, Trash2 } from 'lucide-react';
import { boardsStorage, type Board } from '../lib/storage';
import { generateId } from '../lib/utils-flowdesk';
import { toast } from 'sonner';
import { Link } from 'react-router';

export function Boards() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardEmoji, setNewBoardEmoji] = useState('📋');

  useEffect(() => {
    const storedBoards = boardsStorage.get();
    if (storedBoards.length === 0) {
      // Create a default board
      const defaultBoard: Board = {
        id: generateId(),
        name: 'My First Board',
        emoji: '📋',
        columns: [
          { id: generateId(), title: 'Backlog', cards: [] },
          { id: generateId(), title: 'In Progress', cards: [] },
          { id: generateId(), title: 'Review', cards: [] },
          { id: generateId(), title: 'Done', cards: [] },
        ],
      };
      boardsStorage.set([defaultBoard]);
      setBoards([defaultBoard]);
    } else {
      setBoards(storedBoards);
    }
  }, []);

  const saveBoards = (updatedBoards: Board[]) => {
    setBoards(updatedBoards);
    boardsStorage.set(updatedBoards);
  };

  const addBoard = () => {
    if (!newBoardName.trim()) return;

    const newBoard: Board = {
      id: generateId(),
      name: newBoardName,
      emoji: newBoardEmoji,
      columns: [
        { id: generateId(), title: 'Backlog', cards: [] },
        { id: generateId(), title: 'In Progress', cards: [] },
        { id: generateId(), title: 'Review', cards: [] },
        { id: generateId(), title: 'Done', cards: [] },
      ],
    };

    saveBoards([...boards, newBoard]);
    setNewBoardName('');
    setNewBoardEmoji('📋');
    setIsAddDialogOpen(false);
    toast.success('Board created!');
  };

  const deleteBoard = (id: string) => {
    saveBoards(boards.filter((b) => b.id !== id));
    toast.success('Board deleted');
  };

  const getBoardProgress = (board: Board): number => {
    const totalCards = board.columns.reduce((sum, col) => sum + col.cards.length, 0);
    if (totalCards === 0) return 0;
    const doneColumn = board.columns.find((col) => col.title === 'Done');
    const doneCards = doneColumn ? doneColumn.cards.length : 0;
    return (doneCards / totalCards) * 100;
  };

  return (
    <div className="p-6 space-y-6 pb-24 md:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Boards</h1>
          <p className="text-muted-foreground">Organize projects with Kanban boards</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Board
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Board</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm mb-2 block">Board Name</label>
                <Input
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  placeholder="e.g., Project Alpha"
                  onKeyDown={(e) => e.key === 'Enter' && addBoard()}
                />
              </div>
              <div>
                <label className="text-sm mb-2 block">Emoji</label>
                <div className="flex gap-2">
                  {['📋', '🎯', '💼', '🚀', '⚡', '🎨', '💡', '🔧'].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setNewBoardEmoji(emoji)}
                      className={`text-2xl p-2 rounded-lg border-2 ${
                        newBoardEmoji === emoji ? 'border-primary' : 'border-transparent'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              <Button onClick={addBoard} className="w-full">
                Create Board
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Boards Grid */}
      {boards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {boards.map((board) => {
            const progress = getBoardProgress(board);
            const totalCards = board.columns.reduce((sum, col) => sum + col.cards.length, 0);

            return (
              <Card key={board.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl">{board.emoji}</span>
                      <div>
                        <CardTitle>{board.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {totalCards} {totalCards === 1 ? 'card' : 'cards'}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteBoard(board.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2 text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-semibold">{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {board.columns.map((col) => (
                        <div key={col.id} className="bg-muted/50 p-2 rounded">
                          <div className="font-medium truncate">{col.title}</div>
                          <div className="text-muted-foreground">{col.cards.length} cards</div>
                        </div>
                      ))}
                    </div>
                    <Link to={`/board/${board.id}`}>
                      <Button variant="outline" className="w-full">
                        Open Board
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <div className="text-5xl mb-2">📋</div>
          <p className="mb-2">No boards yet</p>
          <p className="text-sm">Create your first Kanban board to get started</p>
        </div>
      )}
    </div>
  );
}
