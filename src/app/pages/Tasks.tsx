import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Checkbox } from '../components/ui/checkbox';
import { Badge } from '../components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Plus, Filter, MoreVertical, Trash2, Calendar as CalendarIcon, Tag, ChevronDown, ChevronUp } from 'lucide-react';
import { Task } from '../lib/storage';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

const TaskItem: React.FC<{
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (task: Task) => void;
  index: number;
  moveTask: (dragIndex: number, hoverIndex: number) => void;
}> = ({ task, onToggle, onDelete, onUpdate, index, moveTask }) => {
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(task.title);

  const [{ isDragging }, drag] = useDrag({
    type: 'task',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'task',
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        moveTask(item.index, index);
        item.index = index;
      }
    },
  });

  const handleTitleSave = () => {
    if (titleInput.trim()) {
      onUpdate({ ...task, title: titleInput });
    }
    setEditingTitle(false);
  };

  const priorityColors = {
    high: 'bg-destructive text-destructive-foreground',
    medium: 'bg-warning text-warning-foreground',
    low: 'bg-success text-success-foreground',
  };

  const priorityIcons = {
    high: '🔴',
    medium: '🟡',
    low: '🟢',
  };

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`group border rounded-lg p-4 bg-card transition-all hover:border-primary ${
        isDragging ? 'opacity-50' : ''
      } ${task.completed ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => onToggle(task.id)}
          className="mt-1"
        />

        <div className="flex-1 min-w-0">
          {editingTitle ? (
            <Input
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleSave();
                if (e.key === 'Escape') {
                  setEditingTitle(false);
                  setTitleInput(task.title);
                }
              }}
              autoFocus
              className="mb-2"
            />
          ) : (
            <h4
              className={`font-medium mb-2 cursor-pointer ${
                task.completed ? 'line-through text-muted-foreground' : ''
              }`}
              onClick={() => setEditingTitle(true)}
            >
              {task.title}
            </h4>
          )}

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant="outline" className={priorityColors[task.priority]}>
              {priorityIcons[task.priority]} {task.priority}
            </Badge>

            {task.dueDate && (
              <Badge variant="outline" className="gap-1">
                <CalendarIcon className="h-3 w-3" />
                {new Date(task.dueDate).toLocaleDateString()}
              </Badge>
            )}

            {task.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1">
                <Tag className="h-3 w-3" />
                {tag}
              </Badge>
            ))}
          </div>

          {task.subtasks.length > 0 && (
            <div className="mt-2">
              <button
                onClick={() => setShowSubtasks(!showSubtasks)}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                {showSubtasks ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                {task.subtasks.filter(s => s.completed).length} / {task.subtasks.length} subtasks
              </button>

              {showSubtasks && (
                <div className="mt-2 space-y-2 pl-4">
                  {task.subtasks.map((subtask) => (
                    <div key={subtask.id} className="flex items-center gap-2">
                      <Checkbox
                        checked={subtask.completed}
                        onCheckedChange={() => {
                          const updated = task.subtasks.map(s =>
                            s.id === subtask.id ? { ...s, completed: !s.completed } : s
                          );
                          onUpdate({ ...task, subtasks: updated });
                        }}
                      />
                      <span className={`text-sm ${subtask.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {subtask.title}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export const Tasks: React.FC = () => {
  const { tasks, setTasks } = useApp();
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'someday' | 'completed'>('today');
  const [showNewTaskDialog, setShowNewTaskDialog] = useState(false);
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterTag, setFilterTag] = useState<string>('all');

  const [newTask, setNewTask] = useState({
    title: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    dueDate: '',
    tags: [] as string[],
    section: 'today' as 'today' | 'upcoming' | 'someday',
  });

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    tasks.forEach(t => t.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags);
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    let filtered = activeTab === 'completed' 
      ? tasks.filter(t => t.completed)
      : tasks.filter(t => t.section === activeTab && !t.completed);

    if (filterPriority !== 'all') {
      filtered = filtered.filter(t => t.priority === filterPriority);
    }

    if (filterTag !== 'all') {
      filtered = filtered.filter(t => t.tags.includes(filterTag));
    }

    return filtered;
  }, [tasks, activeTab, filterPriority, filterTag]);

  const handleCreateTask = () => {
    if (!newTask.title.trim()) return;

    const task: Task = {
      id: crypto.randomUUID(),
      title: newTask.title,
      completed: false,
      priority: newTask.priority,
      dueDate: newTask.dueDate || undefined,
      tags: newTask.tags,
      subtasks: [],
      section: newTask.section,
      createdAt: new Date().toISOString(),
    };

    setTasks([...tasks, task]);
    setNewTask({
      title: '',
      priority: 'medium',
      dueDate: '',
      tags: [],
      section: 'today',
    });
    setShowNewTaskDialog(false);
    toast.success('Task created!');
  };

  const handleToggleTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const wasCompleted = task.completed;
    
    setTasks(
      tasks.map(t =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    );

    if (!wasCompleted) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
      toast.success('Task completed! 🎉');
    }
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
    toast.success('Task deleted');
  };

  const handleUpdateTask = (updated: Task) => {
    setTasks(tasks.map(t => t.id === updated.id ? updated : t));
  };

  const moveTask = (dragIndex: number, hoverIndex: number) => {
    const dragTask = filteredTasks[dragIndex];
    const newTasks = [...filteredTasks];
    newTasks.splice(dragIndex, 1);
    newTasks.splice(hoverIndex, 0, dragTask);

    // Update the full tasks array while maintaining other sections
    const otherTasks = tasks.filter(t => 
      activeTab === 'completed' ? !t.completed : t.section !== activeTab || t.completed
    );
    setTasks([...otherTasks, ...newTasks]);
  };

  const handleCompleteAll = () => {
    setTasks(tasks.map(t => 
      t.section === activeTab && !t.completed ? { ...t, completed: true } : t
    ));
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    toast.success('All tasks completed! 🎉');
  };

  const handleDeleteCompleted = () => {
    setTasks(tasks.filter(t => !t.completed));
    toast.success('Completed tasks deleted');
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Tasks</h1>
            <p className="text-muted-foreground">Organize your work and life</p>
          </div>
          <Button onClick={() => setShowNewTaskDialog(true)} className="gap-2">
            <Plus className="h-5 w-5" />
            New Task
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-4 mb-6 border-b">
          {(['today', 'upcoming', 'someday', 'completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-1 capitalize transition-colors border-b-2 ${
                activeTab === tab
                  ? 'border-primary text-primary font-medium'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
              <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded-full">
                {tab === 'completed' 
                  ? tasks.filter(t => t.completed).length
                  : tasks.filter(t => t.section === tab && !t.completed).length
                }
              </span>
            </button>
          ))}
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Priority: {filterPriority}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterPriority('all')}>All</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterPriority('high')}>High</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterPriority('medium')}>Medium</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterPriority('low')}>Low</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {allTags.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Tag className="h-4 w-4" />
                  Tag: {filterTag}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterTag('all')}>All</DropdownMenuItem>
                {allTags.map(tag => (
                  <DropdownMenuItem key={tag} onClick={() => setFilterTag(tag)}>
                    {tag}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <div className="flex-1" />

          {activeTab !== 'completed' && filteredTasks.length > 0 && (
            <Button variant="outline" onClick={handleCompleteAll}>
              Complete All
            </Button>
          )}

          {activeTab === 'completed' && filteredTasks.length > 0 && (
            <Button variant="outline" onClick={handleDeleteCompleted}>
              Delete Completed
            </Button>
          )}
        </div>

        {/* Tasks List */}
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="max-w-sm mx-auto">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="font-bold text-lg mb-2">No tasks yet</h3>
                <p className="text-muted-foreground mb-4">
                  {activeTab === 'completed' 
                    ? "You haven't completed any tasks yet."
                    : `Create your first ${activeTab} task to get started.`
                  }
                </p>
                {activeTab !== 'completed' && (
                  <Button onClick={() => setShowNewTaskDialog(true)}>
                    Create Task
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            filteredTasks.map((task, index) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={handleToggleTask}
                onDelete={handleDeleteTask}
                onUpdate={handleUpdateTask}
                index={index}
                moveTask={moveTask}
              />
            ))
          )}
        </div>

        {/* New Task Dialog */}
        <Dialog open={showNewTaskDialog} onOpenChange={setShowNewTaskDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="What needs to be done?"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Section</Label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {(['today', 'upcoming', 'someday'] as const).map((section) => (
                    <Button
                      key={section}
                      variant={newTask.section === section ? 'default' : 'outline'}
                      onClick={() => setNewTask({ ...newTask, section })}
                      className="capitalize"
                    >
                      {section}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Priority</Label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {(['high', 'medium', 'low'] as const).map((priority) => (
                    <Button
                      key={priority}
                      variant={newTask.priority === priority ? 'default' : 'outline'}
                      onClick={() => setNewTask({ ...newTask, priority })}
                      className="capitalize"
                    >
                      {priority === 'high' ? '🔴' : priority === 'medium' ? '🟡' : '🟢'} {priority}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Due Date (Optional)</Label>
                <Input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Tags (Optional)</Label>
                <Input
                  placeholder="Enter tags separated by commas"
                  onChange={(e) => setNewTask({ 
                    ...newTask, 
                    tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                  })}
                  className="mt-1"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleCreateTask} className="flex-1">
                  Create Task
                </Button>
                <Button variant="outline" onClick={() => setShowNewTaskDialog(false)}>
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
