import { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { eventsStorage, type CalendarEvent } from '../lib/storage';
import { generateId } from '../lib/utils-flowdesk';
import { toast } from 'sonner';

const CATEGORY_COLORS = {
  work: 'bg-blue-500',
  personal: 'bg-purple-500',
  health: 'bg-green-500',
  learning: 'bg-yellow-500',
};

export function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [newEvent, setNewEvent] = useState({
    title: '',
    time: '',
    category: 'personal' as 'work' | 'personal' | 'health' | 'learning',
    recurring: undefined as 'daily' | 'weekly' | undefined,
  });

  useEffect(() => {
    setEvents(eventsStorage.get());
  }, []);

  const saveEvents = (updatedEvents: CalendarEvent[]) => {
    setEvents(updatedEvents);
    eventsStorage.set(updatedEvents);
  };

  const addEvent = () => {
    if (!newEvent.title || !selectedDate) return;

    const event: CalendarEvent = {
      id: generateId(),
      title: newEvent.title,
      date: selectedDate,
      time: newEvent.time,
      category: newEvent.category,
      recurring: newEvent.recurring,
    };

    saveEvents([...events, event]);
    setIsAddDialogOpen(false);
    setNewEvent({ title: '', time: '', category: 'personal', recurring: undefined });
    toast.success('Event added!');
  };

  const getDaysInMonth = (date: Date): Date[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: Date[] = [];

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push(new Date(year, month - 1, prevMonthLastDay - i));
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    // Next month days
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push(new Date(year, month + 1, i));
    }

    return days;
  };

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter((e) => e.date === dateStr);
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const days = getDaysInMonth(currentDate);
  const isToday = (date: Date) => date.toDateString() === new Date().toDateString();
  const isCurrentMonth = (date: Date) => date.getMonth() === currentDate.getMonth();

  return (
    <div className="p-6 space-y-6 pb-24 md:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">Plan your days ahead</p>
        </div>
        <div className="flex gap-2">
          <Select value={view} onValueChange={(v: any) => setView(v)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="day">Day</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Calendar Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" size="icon" onClick={() => navigateMonth(-1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-2xl font-bold">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <Button variant="outline" size="icon" onClick={() => navigateMonth(1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Month View */}
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center font-semibold text-sm p-2">
                {day}
              </div>
            ))}
            {days.map((day, i) => {
              const dayEvents = getEventsForDate(day);
              return (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedDate(day.toISOString().split('T')[0]);
                    setIsAddDialogOpen(true);
                  }}
                  className={`min-h-24 p-2 rounded-lg border transition-all hover:shadow-md ${
                    isToday(day)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : isCurrentMonth(day)
                      ? 'bg-card border-border'
                      : 'bg-muted/30 border-transparent text-muted-foreground'
                  }`}
                >
                  <div className="font-semibold mb-1">{day.getDate()}</div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        className={`text-xs p-1 rounded truncate ${
                          CATEGORY_COLORS[event.category]
                        } text-white`}
                      >
                        {event.time} {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-muted-foreground">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-4">Upcoming Events</h3>
          {events.length > 0 ? (
            <div className="space-y-2">
              {events
                .filter((e) => new Date(e.date) >= new Date())
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 5)
                .map((event) => (
                  <div key={event.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className={`w-3 h-3 rounded-full ${CATEGORY_COLORS[event.category]}`} />
                    <div className="flex-1">
                      <div className="font-medium">{event.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(event.date).toLocaleDateString()} {event.time && `• ${event.time}`}
                      </div>
                    </div>
                    <div className="text-xs px-2 py-1 rounded bg-muted capitalize">
                      {event.category}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <div className="text-4xl mb-2">📅</div>
              <p>No upcoming events</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Event Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm mb-2 block">Event Title</label>
              <Input
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="Enter event title"
              />
            </div>
            <div>
              <label className="text-sm mb-2 block">Time (optional)</label>
              <Input
                type="time"
                value={newEvent.time}
                onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm mb-2 block">Category</label>
              <Select
                value={newEvent.category}
                onValueChange={(value: any) => setNewEvent({ ...newEvent, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="work">🔵 Work</SelectItem>
                  <SelectItem value="personal">🟣 Personal</SelectItem>
                  <SelectItem value="health">🟢 Health</SelectItem>
                  <SelectItem value="learning">🟡 Learning</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm mb-2 block">Recurring (optional)</label>
              <Select
                value={newEvent.recurring || 'none'}
                onValueChange={(value: any) =>
                  setNewEvent({ ...newEvent, recurring: value === 'none' ? undefined : value })
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
            <Button onClick={addEvent} className="w-full">
              Add Event
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
