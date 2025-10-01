import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Pill, Calendar, AlertTriangle, Check, Trash2, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Notifications() {
  const [filter, setFilter] = useState<"all" | "medication" | "appointment" | "alert">("all");

  const notifications = [
    {
      id: 1,
      type: "medication",
      title: "Medication Reminder",
      message: "Time to take Lisinopril 10mg",
      time: "30 minutes ago",
      read: false,
      priority: "high"
    },
    {
      id: 2,
      type: "appointment",
      title: "Upcoming Appointment",
      message: "Routine checkup with Dr. Sarah Williams tomorrow at 2:00 PM",
      time: "1 hour ago",
      read: false,
      priority: "medium"
    },
    {
      id: 3,
      type: "alert",
      title: "Low Medication Stock",
      message: "Metformin stock is running low. Only 5 doses remaining.",
      time: "2 hours ago",
      read: false,
      priority: "high"
    },
    {
      id: 4,
      type: "medication",
      title: "Medication Taken",
      message: "Margaret Johnson confirmed taking Metformin at 12:00 PM",
      time: "3 hours ago",
      read: true,
      priority: "low"
    },
    {
      id: 5,
      type: "appointment",
      title: "Appointment Completed",
      message: "Blood work appointment completed successfully",
      time: "Yesterday",
      read: true,
      priority: "low"
    },
    {
      id: 6,
      type: "medication",
      title: "Medication Reminder",
      message: "Evening dose of Aspirin is due at 8:00 PM",
      time: "5 hours ago",
      read: false,
      priority: "medium"
    },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case "medication":
        return <Pill className="w-5 h-5" />;
      case "appointment":
        return <Calendar className="w-5 h-5" />;
      case "alert":
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getIconBg = (type: string) => {
    switch (type) {
      case "medication":
        return "bg-primary/10 text-primary";
      case "appointment":
        return "bg-secondary/10 text-secondary";
      case "alert":
        return "bg-warning/10 text-warning";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const filteredNotifications = filter === "all" 
    ? notifications 
    : notifications.filter(n => n.type === filter);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Check className="w-4 h-4 mr-2" />
            Mark All Read
          </Button>
          <Button variant="outline" size="sm">
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          <Filter className="w-4 h-4 mr-2" />
          All
        </Button>
        <Button
          variant={filter === "medication" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("medication")}
        >
          <Pill className="w-4 h-4 mr-2" />
          Medications
        </Button>
        <Button
          variant={filter === "appointment" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("appointment")}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Appointments
        </Button>
        <Button
          variant={filter === "alert" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("alert")}
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          Alerts
        </Button>
      </div>

      <div className="space-y-3">
        {filteredNotifications.map((notification) => (
          <Card 
            key={notification.id} 
            className={`shadow-card hover-scale cursor-pointer transition-all ${
              !notification.read ? 'border-l-4 border-l-primary bg-primary/5' : ''
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getIconBg(notification.type)}`}>
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-medium ${!notification.read ? 'font-bold' : ''}`}>
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
                    </div>
                    <Badge 
                      variant={notification.priority === "high" ? "destructive" : "secondary"}
                      className="shrink-0"
                    >
                      {notification.priority}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  {!notification.read && (
                    <Button variant="ghost" size="sm">
                      <Check className="w-4 h-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}