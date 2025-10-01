import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, Moon, Volume2, Lock, User, Globe, HelpCircle } from "lucide-react";

export default function Settings() {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your application preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="medication-reminders">Medication Reminders</Label>
              <Switch id="medication-reminders" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="appointment-reminders">Appointment Reminders</Label>
              <Switch id="appointment-reminders" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="low-stock-alerts">Low Stock Alerts</Label>
              <Switch id="low-stock-alerts" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <Switch id="email-notifications" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
              Voice Assistant
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="voice-enabled">Enable Voice Companion</Label>
              <Switch id="voice-enabled" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-response">Auto Response</Label>
              <Switch id="auto-response" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="voice-feedback">Voice Feedback</Label>
              <Switch id="voice-feedback" defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="w-5 h-5" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode">Dark Mode</Label>
              <Switch id="dark-mode" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="compact-view">Compact View</Label>
              <Switch id="compact-view" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="animations">Animations</Label>
              <Switch id="animations" defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Privacy & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="two-factor">Two-Factor Authentication</Label>
              <Switch id="two-factor" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-lock">Auto-Lock</Label>
              <Switch id="auto-lock" defaultChecked />
            </div>
            <Button variant="outline" className="w-full">
              Change Password
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <User className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Globe className="w-4 h-4 mr-2" />
              Language Preferences
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <HelpCircle className="w-4 h-4 mr-2" />
              Help & Support
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Version</span>
              <span className="text-sm font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Last Updated</span>
              <span className="text-sm font-medium">October 2025</span>
            </div>
            <Button variant="outline" className="w-full mt-4">
              Check for Updates
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}