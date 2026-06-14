import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { CalendarEvent } from '../lib/storage';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { toast } from 'sonner';

const CATEGORY_COLORS = {
  work: { bg: 'bg-chart-4/20', text: 'text-chart-4', border: 'border-chart-4' },
  personal: { bg: 'bg-primary/20', text: 'text-primary', border: 'border-primary' },
  health: { bg: 'bg-success/20', text: 'text-success', border: 'border-success' },
  learning: { bg: 'bg-warning/20', text: 'text-warning', border: 'border-warning' },
};

const CATEGORY_ICONS = {
  work: '🔵',
  personal: '🟣',
  health: '🟢',
  learning: '🟡',
};

export const Calendar: React.FC = () => {
  const { events, setEvents } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    time: '',
    category: 'personal' as 'work' | 'personal' | 'health' | 'learning',
    recurring: '' as '' | 'daily' | 'weekly',
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getEventsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return events.filter(e => e.date === dateStr);
  };

  const handleCreateEvent = () => {
    if (!selectedDate || !newEvent.title.trim()) return;

    const event: CalendarEvent = {
      id: crypto.randomUUID(),
      title: newEvent.title,
      date: format(selectedDate, 'yyyy-MM-dd'),
      time: newEvent.time,
      category: newEvent.category,
      recurring: newEvent.recurring || undefined,
      createdAt: new Date().toISOString(),
    };

    setEvents([...events, event]);
    setNewEvent({
      title: '',
      time: '',
      category: 'personal',
      recurring: '',
    });
    setShowEventDialog(false);
    toast.success('Event created!');
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowEventDialog(true);
  };

  const upcomingEvents = events
    .filter(e => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Calendar</h1>
          <p className="text-muted-foreground">Plan your schedule</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-3">
          <Card className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentDate(new Date())}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Days of Week */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day) => {
                const dayEvents = getEventsForDate(day);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isDayToday = isToday(day);

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => handleDateClick(day)}
                    className={`min-h-24 p-2 rounded-lg border-2 transition-all hover:border-primary ${
                      isDayToday ? 'border-primary bg-primary/5' : 'border-transparent bg-muted/30'
                    } ${!isCurrentMonth ? 'opacity-40' : ''}`}
                  >
                    <div className={`text-sm font-medium mb-1 ${
                      isDayToday ? 'text-primary' : ''
                    }`}>
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          className={`text-xs p-1 rounded truncate ${CATEGORY_COLORS[event.category].bg} ${CATEGORY_COLORS[event.category].text}`}
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
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Add Event */}
          <Card className="p-6">
            <Button onClick={() => {
              setSelectedDate(new Date());
              setShowEventDialog(true);
            }} className="w-full gap-2">
              <Plus className="h-5 w-5" />
              New Event
            </Button>
          </Card>

          {/* Upcoming Events */}
          <Card className="p-6">
            <h3 className="font-bold mb-4">Upcoming</h3>
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No upcoming events
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span>{CATEGORY_ICONS[event.category]}</span>
                      <span className="font-medium text-sm">{event.title}</span>
                    </div>
                    <div className="text-xs text-muted-foreground pl-6">
                      {format(new Date(event.date), 'MMM d')} at {event.time}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Categories */}
          <Card className="p-6">
            <h3 className="font-bold mb-4">Categories</h3>
            <div className="space-y-2">
              {Object.entries(CATEGORY_COLORS).map(([category, colors]) => (
                <div key={category} className="flex items-center gap-2 text-sm">
                  <div className={`w-3 h-3 rounded-full ${colors.bg}`} />
                  <span className="capitalize">{category}</span>
                  <span className="ml-auto text-muted-foreground">
                    {events.filter(e => e.category === category).length}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Event Dialog */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'New Event'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label>Event Title</Label>
              <Input
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="What's the event?"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Time</Label>
              <Input
                type="time"
                value={newEvent.time}
                onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Category</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {Object.entries(CATEGORY_ICONS).map(([category, icon]) => (
                  <Button
                    key={category}
                    variant={newEvent.category === category ? 'default' : 'outline'}
                    onClick={() => setNewEvent({ ...newEvent, category: category as any })}
                    className="capitalize"
                  >
                    {icon} {category}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label>Recurring (Optional)</Label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                <Button
                  variant={newEvent.recurring === '' ? 'default' : 'outline'}
                  onClick={() => setNewEvent({ ...newEvent, recurring: '' })}
                >
                  Once
                </Button>
                <Button
                  variant={newEvent.recurring === 'daily' ? 'default' : 'outline'}
                  onClick={() => setNewEvent({ ...newEvent, recurring: 'daily' })}
                >
                  Daily
                </Button>
                <Button
                  variant={newEvent.recurring === 'weekly' ? 'default' : 'outline'}
                  onClick={() => setNewEvent({ ...newEvent, recurring: 'weekly' })}
                >
                  Weekly
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreateEvent} className="flex-1">
                Create Event
              </Button>
              <Button variant="outline" onClick={() => setShowEventDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
