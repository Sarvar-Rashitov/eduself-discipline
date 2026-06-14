import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Switch } from '../components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Plus, Bell, Trash2 } from 'lucide-react';
import { remindersStorage, type Reminder } from '../lib/storage';
import { generateId } from '../lib/utils-flowdesk';
import { toast } from 'sonner';

const CATEGORY_ICONS = {
  medication: '💊',
  meeting: '📞',
  exercise: '🏃',
  custom: '🔔',
};

export function Reminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newReminder, setNewReminder] = useState({
    title: '',
    time: '',
    category: 'custom' as 'medication' | 'meeting' | 'exercise' | 'custom',
    repeat: undefined as 'daily' | 'weekly' | undefined,
  });

  useEffect(() => {
    setReminders(remindersStorage.get());
  }, []);

  const saveReminders = (updatedReminders: Reminder[]) => {
    setReminders(updatedReminders);
    remindersStorage.set(updatedReminders);
  };

  const addReminder = () => {
    if (!newReminder.title.trim() || !newReminder.time) return;

    const reminder: Reminder = {
      id: generateId(),
      title: newReminder.title,
      time: newReminder.time,
      category: newReminder.category,
      repeat: newReminder.repeat,
      enabled: true,
    };

    saveReminders([...reminders, reminder]);
    setNewReminder({ title: '', time: '', category: 'custom', repeat: undefined });
    setIsAddDialogOpen(false);
    toast.success('Reminder added!');
  };

  const toggleReminder = (id: string) => {
    const updatedReminders = reminders.map((r) =>
      r.id === id ? { ...r, enabled: !r.enabled } : r
    );
    saveReminders(updatedReminders);
  };

  const deleteReminder = (id: string) => {
    saveReminders(reminders.filter((r) => r.id !== id));
    toast.success('Reminder deleted');
  };

  const groupedReminders = {
    medication: reminders.filter((r) => r.category === 'medication'),
    meeting: reminders.filter((r) => r.category === 'meeting'),
    exercise: reminders.filter((r) => r.category === 'exercise'),
    custom: reminders.filter((r) => r.category === 'custom'),
  };

  return (
    <div className="p-6 space-y-6 pb-24 md:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reminders</h1>
          <p className="text-muted-foreground">Never miss important moments</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Reminder
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Reminder</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm mb-2 block">Remind me to...</label>
                <Input
                  value={newReminder.title}
                  onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                  placeholder="e.g., Take medicine"
                />
              </div>
              <div>
                <label className="text-sm mb-2 block">Time</label>
                <Input
                  type="time"
                  value={newReminder.time}
                  onChange={(e) => setNewReminder({ ...newReminder, time: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm mb-2 block">Category</label>
                <Select
                  value={newReminder.category}
                  onValueChange={(value: any) =>
                    setNewReminder({ ...newReminder, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medication">💊 Medication</SelectItem>
                    <SelectItem value="meeting">📞 Meeting</SelectItem>
                    <SelectItem value="exercise">🏃 Exercise</SelectItem>
                    <SelectItem value="custom">🔔 Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm mb-2 block">Repeat</label>
                <Select
                  value={newReminder.repeat || 'none'}
                  onValueChange={(value: any) =>
                    setNewReminder({
                      ...newReminder,
                      repeat: value === 'none' ? undefined : value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={addReminder} className="w-full">
                Add Reminder
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Reminders by Category */}
      {reminders.length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedReminders).map(
            ([category, categoryReminders]) =>
              categoryReminders.length > 0 && (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span>{CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS]}</span>
                      <span className="capitalize">{category}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {categoryReminders.map((reminder) => (
                        <div
                          key={reminder.id}
                          className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <Switch
                            checked={reminder.enabled}
                            onCheckedChange={() => toggleReminder(reminder.id)}
                          />
                          <div className="flex-1">
                            <div className="font-medium">{reminder.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {reminder.time}
                              {reminder.repeat && ` • Repeats ${reminder.repeat}`}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteReminder(reminder.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
          )}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <div className="text-5xl mb-2">🔔</div>
          <p className="mb-2">No reminders set</p>
          <p className="text-sm">Add reminders to stay on top of your schedule</p>
        </div>
      )}
    </div>
  );
}
