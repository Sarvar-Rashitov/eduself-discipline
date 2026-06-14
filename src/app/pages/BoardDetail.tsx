import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useParams, useNavigate } from 'react-router';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Plus, ArrowLeft, Calendar as CalendarIcon, Tag, User } from 'lucide-react';
import { Card as KanbanCard } from '../lib/storage';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { toast } from 'sonner';

const ASSIGNEE_COLORS = ['#7C3AED', '#10B981', '#F59E0B', '#3B82F6', '#EC4899', '#14B8A6'];

const CardItem: React.FC<{
  card: KanbanCard;
  columnId: string;
  onMove: (cardId: string, toColumnId: string) => void;
}> = ({ card, columnId, onMove }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'card',
    item: { cardId: card.id, fromColumnId: columnId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const priorityColors = {
    high: 'bg-destructive text-destructive-foreground',
    medium: 'bg-warning text-warning-foreground',
    low: 'bg-success text-success-foreground',
  };

  return (
    <div
      ref={drag}
      className={`bg-card border rounded-lg p-3 cursor-move ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <h4 className="font-medium mb-2">{card.title}</h4>
      
      <div className="flex flex-wrap items-center gap-2 mb-2">
        {card.priority && (
          <Badge variant="outline" className={`text-xs ${priorityColors[card.priority]}`}>
            {card.priority}
          </Badge>
        )}
        
        {card.tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="text-xs">
            {tag}
          </Badge>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        {card.assignee && (
          <div className="flex items-center gap-1">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs"
              style={{ backgroundColor: card.assignee.color }}
            >
              {card.assignee.name.charAt(0).toUpperCase()}
            </div>
            <span>{card.assignee.name}</span>
          </div>
        )}
        
        {card.dueDate && (
          <div className="flex items-center gap-1">
            <CalendarIcon className="h-3 w-3" />
            {new Date(card.dueDate).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
};

const Column: React.FC<{
  column: any;
  boardId: string;
  onMove: (cardId: string, toColumnId: string) => void;
  onAddCard: (columnId: string) => void;
}> = ({ column, boardId, onMove, onAddCard }) => {
  const [, drop] = useDrop({
    accept: 'card',
    drop: (item: { cardId: string; fromColumnId: string }) => {
      if (item.fromColumnId !== column.id) {
        onMove(item.cardId, column.id);
      }
    },
  });

  return (
    <div className="flex-shrink-0 w-80">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">{column.title}</h3>
          <Badge variant="outline">{column.cards.length}</Badge>
        </div>

        <div
          ref={drop}
          className="space-y-3 min-h-[200px]"
        >
          {column.cards.map((card: KanbanCard) => (
            <CardItem
              key={card.id}
              card={card}
              columnId={column.id}
              onMove={onMove}
            />
          ))}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddCard(column.id)}
          className="w-full mt-3 gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Card
        </Button>
      </Card>
    </div>
  );
};

export const BoardDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { boards, setBoards } = useApp();
  const [showCardDialog, setShowCardDialog] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState('');
  const [newCard, setNewCard] = useState({
    title: '',
    description: '',
    assignee: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    dueDate: '',
    tags: [] as string[],
  });

  const board = boards.find(b => b.id === id);

  if (!board) {
    return (
      <div className="p-6">
        <p>Board not found</p>
        <Button onClick={() => navigate('/boards')}>Back to Boards</Button>
      </div>
    );
  }

  const handleAddCard = (columnId: string) => {
    setSelectedColumnId(columnId);
    setShowCardDialog(true);
  };

  const handleCreateCard = () => {
    if (!newCard.title.trim()) return;

    const card: KanbanCard = {
      id: crypto.randomUUID(),
      title: newCard.title,
      description: newCard.description,
      assignee: newCard.assignee ? {
        name: newCard.assignee,
        color: ASSIGNEE_COLORS[Math.floor(Math.random() * ASSIGNEE_COLORS.length)],
      } : { name: '', color: '' },
      priority: newCard.priority,
      dueDate: newCard.dueDate || undefined,
      tags: newCard.tags,
      comments: 0,
      checklist: [],
      createdAt: new Date().toISOString(),
    };

    const updatedBoards = boards.map(b => {
      if (b.id === board.id) {
        return {
          ...b,
          columns: b.columns.map(col => {
            if (col.id === selectedColumnId) {
              return { ...col, cards: [...col.cards, card] };
            }
            return col;
          }),
        };
      }
      return b;
    });

    setBoards(updatedBoards);
    setNewCard({
      title: '',
      description: '',
      assignee: '',
      priority: 'medium',
      dueDate: '',
      tags: [],
    });
    setShowCardDialog(false);
    toast.success('Card created!');
  };

  const handleMoveCard = (cardId: string, toColumnId: string) => {
    const updatedBoards = boards.map(b => {
      if (b.id === board.id) {
        let movedCard: KanbanCard | null = null;

        const columnsWithoutCard = b.columns.map(col => ({
          ...col,
          cards: col.cards.filter(card => {
            if (card.id === cardId) {
              movedCard = card;
              return false;
            }
            return true;
          }),
        }));

        if (!movedCard) return b;

        return {
          ...b,
          columns: columnsWithoutCard.map(col => {
            if (col.id === toColumnId) {
              return { ...col, cards: [...col.cards, movedCard!] };
            }
            return col;
          }),
        };
      }
      return b;
    });

    setBoards(updatedBoards);
    toast.success('Card moved!');
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-6">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/boards')}
            className="gap-2 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Boards
          </Button>

          <div className="flex items-center gap-3">
            <span className="text-4xl">{board.emoji}</span>
            <h1 className="text-3xl font-bold">{board.name}</h1>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="flex gap-4 pb-4">
            {board.columns.map((column) => (
              <Column
                key={column.id}
                column={column}
                boardId={board.id}
                onMove={handleMoveCard}
                onAddCard={handleAddCard}
              />
            ))}
          </div>
        </div>

        <Dialog open={showCardDialog} onOpenChange={setShowCardDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Card</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={newCard.title}
                  onChange={(e) => setNewCard({ ...newCard, title: e.target.value })}
                  placeholder="Card title"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={newCard.description}
                  onChange={(e) => setNewCard({ ...newCard, description: e.target.value })}
                  placeholder="Add details..."
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Assignee</Label>
                  <Input
                    value={newCard.assignee}
                    onChange={(e) => setNewCard({ ...newCard, assignee: e.target.value })}
                    placeholder="Name"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={newCard.dueDate}
                    onChange={(e) => setNewCard({ ...newCard, dueDate: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>Priority</Label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {(['high', 'medium', 'low'] as const).map((priority) => (
                    <Button
                      key={priority}
                      variant={newCard.priority === priority ? 'default' : 'outline'}
                      onClick={() => setNewCard({ ...newCard, priority })}
                      className="capitalize"
                    >
                      {priority}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Tags (comma-separated)</Label>
                <Input
                  placeholder="design, urgent"
                  onChange={(e) => setNewCard({
                    ...newCard,
                    tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                  })}
                  className="mt-1"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleCreateCard} className="flex-1">
                  Create Card
                </Button>
                <Button variant="outline" onClick={() => setShowCardDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DndProvider>
  );
};
