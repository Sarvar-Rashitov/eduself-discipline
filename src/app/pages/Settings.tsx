import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Slider } from '../components/ui/slider';
import { User, Bell, Palette, Timer, Download, Upload, Trash2, Sun, Moon, Monitor } from 'lucide-react';
import { toast } from 'sonner';
import { exportAllData, importData, storage } from '../lib/storage';

const ACCENT_COLORS = [
  { name: 'Violet', value: '#7C3AED' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Green', value: '#10B981' },
  { name: 'Orange', value: '#F59E0B' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Cyan', value: '#14B8A6' },
];

const AVATAR_COLORS = [
  '#7C3AED', '#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#14B8A6',
  '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16',
];

export const Settings: React.FC = () => {
  const { settings, setSettings } = useApp();
  const [exportData, setExportData] = useState('');
  const [showExport, setShowExport] = useState(false);

  const handleExport = () => {
    const data = exportAllData();
    setExportData(data);
    setShowExport(true);

    // Download as file
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flowdesk-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Data exported!');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const jsonString = event.target?.result as string;
      const success = importData(jsonString);
      
      if (success) {
        toast.success('Data imported! Refreshing...');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        toast.error('Failed to import data. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to delete all data? This cannot be undone.')) {
      storage.clear();
      toast.success('All data cleared! Refreshing...');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Customize your FlowDesk experience</p>
      </div>

      <div className="space-y-6">
        {/* User Profile */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="h-5 w-5 text-primary" />
            <h2 className="font-bold text-xl">Profile</h2>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Your Name</Label>
              <Input
                value={settings.userName}
                onChange={(e) => setSettings({ ...settings, userName: e.target.value })}
                placeholder="Enter your name"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Avatar Color</Label>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {AVATAR_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSettings({ ...settings, avatarColor: color })}
                    className={`w-full aspect-square rounded-lg border-2 transition-all ${
                      settings.avatarColor === color ? 'border-primary ring-2 ring-primary' : 'border-border'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Theme */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Palette className="h-5 w-5 text-primary" />
            <h2 className="font-bold text-xl">Appearance</h2>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Theme</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                <Button
                  variant={settings.theme === 'light' ? 'default' : 'outline'}
                  onClick={() => setSettings({ ...settings, theme: 'light' })}
                  className="gap-2"
                >
                  <Sun className="h-4 w-4" />
                  Light
                </Button>
                <Button
                  variant={settings.theme === 'dark' ? 'default' : 'outline'}
                  onClick={() => setSettings({ ...settings, theme: 'dark' })}
                  className="gap-2"
                >
                  <Moon className="h-4 w-4" />
                  Dark
                </Button>
                <Button
                  variant={settings.theme === 'system' ? 'default' : 'outline'}
                  onClick={() => setSettings({ ...settings, theme: 'system' })}
                  className="gap-2"
                >
                  <Monitor className="h-4 w-4" />
                  System
                </Button>
              </div>
            </div>

            <div>
              <Label>Accent Color</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {ACCENT_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setSettings({ ...settings, accentColor: color.value })}
                    className={`p-3 rounded-lg border-2 transition-all flex items-center gap-2 ${
                      settings.accentColor === color.value ? 'border-primary bg-primary/10' : 'border-border'
                    }`}
                  >
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: color.value }}
                    />
                    <span className="text-sm font-medium">{color.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Pomodoro */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Timer className="h-5 w-5 text-primary" />
            <h2 className="font-bold text-xl">Pomodoro Timer</h2>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Focus Duration</Label>
                <span className="text-sm font-medium">
                  {Math.floor(settings.pomodoroDurations.focus / 60)} minutes
                </span>
              </div>
              <Slider
                value={[settings.pomodoroDurations.focus / 60]}
                onValueChange={(v) => setSettings({
                  ...settings,
                  pomodoroDurations: { ...settings.pomodoroDurations, focus: v[0] * 60 }
                })}
                min={15}
                max={60}
                step={5}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Short Break</Label>
                <span className="text-sm font-medium">
                  {Math.floor(settings.pomodoroDurations.shortBreak / 60)} minutes
                </span>
              </div>
              <Slider
                value={[settings.pomodoroDurations.shortBreak / 60]}
                onValueChange={(v) => setSettings({
                  ...settings,
                  pomodoroDurations: { ...settings.pomodoroDurations, shortBreak: v[0] * 60 }
                })}
                min={3}
                max={15}
                step={1}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Long Break</Label>
                <span className="text-sm font-medium">
                  {Math.floor(settings.pomodoroDurations.longBreak / 60)} minutes
                </span>
              </div>
              <Slider
                value={[settings.pomodoroDurations.longBreak / 60]}
                onValueChange={(v) => setSettings({
                  ...settings,
                  pomodoroDurations: { ...settings.pomodoroDurations, longBreak: v[0] * 60 }
                })}
                min={10}
                max={30}
                step={5}
              />
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="h-5 w-5 text-primary" />
            <h2 className="font-bold text-xl">Notifications</h2>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Enable Notifications</p>
              <p className="text-sm text-muted-foreground">
                Get notified when timers complete
              </p>
            </div>
            <Switch
              checked={settings.notifications}
              onCheckedChange={(checked) => {
                setSettings({ ...settings, notifications: checked });
                if (checked && 'Notification' in window && Notification.permission === 'default') {
                  Notification.requestPermission();
                }
              }}
            />
          </div>
        </Card>

        {/* Data Management */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Download className="h-5 w-5 text-primary" />
            <h2 className="font-bold text-xl">Data Management</h2>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-3">
                Export all your FlowDesk data as JSON for backup or transfer
              </p>
              <Button onClick={handleExport} className="gap-2">
                <Download className="h-4 w-4" />
                Export All Data
              </Button>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-3">
                Import previously exported data
              </p>
              <Input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="cursor-pointer"
              />
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-3">
                Permanently delete all data from FlowDesk
              </p>
              <Button variant="destructive" onClick={handleClearAll} className="gap-2">
                <Trash2 className="h-4 w-4" />
                Clear All Data
              </Button>
            </div>
          </div>
        </Card>

        {/* PWA Install */}
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="font-bold mb-2">Install FlowDesk</h3>
            <p className="text-sm text-muted-foreground">
              Install FlowDesk as a Progressive Web App for offline access and a native app experience.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              const event = new Event('beforeinstallprompt');
              window.dispatchEvent(event);
            }}
          >
            Install App
          </Button>
        </Card>

        {/* About */}
        <Card className="p-6 text-center">
          <h3 className="font-bold text-2xl mb-2">FlowDesk</h3>
          <p className="text-sm text-muted-foreground mb-4">
            A discipline-focused daily life organizer
          </p>
          <p className="text-xs text-muted-foreground">
            Version 1.0.0 • Built with React & localStorage
          </p>
        </Card>
      </div>
    </div>
  );
};
