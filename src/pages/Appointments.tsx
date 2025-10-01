import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, MapPin, Phone, MessageSquare, Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Appointments() {
  const [searchTerm, setSearchTerm] = useState("");

  const appointments = [
    {
      id: 1,
      patient: "Margaret Johnson",
      date: "2025-10-01",
      time: "02:00 PM",
      type: "Routine Checkup",
      doctor: "Dr. Sarah Williams",
      location: "Main Clinic - Room 203",
      status: "upcoming",
      duration: "30 mins"
    },
    {
      id: 2,
      patient: "Robert Smith",
      date: "2025-10-03",
      time: "10:30 AM",
      type: "Follow-up Visit",
      doctor: "Dr. Michael Chen",
      location: "Cardiology Wing",
      status: "upcoming",
      duration: "45 mins"
    },
    {
      id: 3,
      patient: "Margaret Johnson",
      date: "2025-09-28",
      time: "03:00 PM",
      type: "Blood Work",
      doctor: "Dr. Sarah Williams",
      location: "Laboratory",
      status: "completed",
      duration: "20 mins"
    },
  ];

  const filteredAppointments = appointments.filter(apt =>
    apt.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Appointments</h1>
          <p className="text-sm text-muted-foreground">Manage patient appointments and schedules</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Appointment
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search appointments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredAppointments.map((appointment) => (
          <Card key={appointment.id} className="shadow-elevated hover-scale">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{appointment.patient}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{appointment.type}</p>
                </div>
                <Badge variant={appointment.status === "upcoming" ? "default" : "secondary"}>
                  {appointment.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="font-medium">{appointment.date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>{appointment.time} ({appointment.duration})</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>{appointment.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-muted-foreground">Doctor:</span>
                  <span>{appointment.doctor}</span>
                </div>
              </div>

              {appointment.status === "upcoming" && (
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}