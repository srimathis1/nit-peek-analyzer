import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, MapPin, Phone, MessageSquare, Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function Appointments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    patient: "",
    date: "",
    time: "",
    type: "",
    doctor: "",
    location: "",
    phone: ""
  });
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      patient: "Margaret Johnson",
      date: "2025-10-01",
      time: "02:00 PM",
      type: "Routine Checkup",
      doctor: "Dr. Sarah Williams",
      location: "Main Clinic - Room 203",
      status: "upcoming",
      duration: "30 mins",
      phone: "+1234567890"
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
      duration: "45 mins",
      phone: "+1987654321"
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
      duration: "20 mins",
      phone: "+1234567890"
    },
  ]);
  const { toast } = useToast();

  const filteredAppointments = appointments.filter(apt =>
    apt.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateAppointment = () => {
    if (!newAppointment.patient || !newAppointment.date || !newAppointment.time) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const newId = Math.max(...appointments.map(a => a.id), 0) + 1;
    const formattedTime = new Date(`2000-01-01T${newAppointment.time}`).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });

    const appointmentToAdd = {
      id: newId,
      patient: newAppointment.patient,
      date: newAppointment.date,
      time: formattedTime,
      type: newAppointment.type || "General Appointment",
      doctor: newAppointment.doctor || "TBD",
      location: newAppointment.location || "TBD",
      status: "upcoming" as const,
      duration: "30 mins",
      phone: newAppointment.phone || ""
    };

    setAppointments([...appointments, appointmentToAdd]);
    
    toast({
      title: "Appointment Created",
      description: `Appointment for ${newAppointment.patient} on ${newAppointment.date} at ${formattedTime} has been scheduled.`,
    });
    setDialogOpen(false);
    setNewAppointment({ patient: "", date: "", time: "", type: "", doctor: "", location: "", phone: "" });
  };

  const handleCall = (phone: string, patient: string) => {
    if (!phone) {
      toast({
        title: "No Phone Number",
        description: `No phone number available for ${patient}`,
        variant: "destructive",
      });
      return;
    }
    window.location.href = `tel:${phone}`;
  };

  const handleMessage = (patient: string) => {
    toast({
      title: "Message",
      description: `Opening message to ${patient}...`,
    });
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Appointments</h1>
          <p className="text-sm text-muted-foreground">Manage patient appointments and schedules</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Schedule New Appointment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="patient">Patient Name *</Label>
                <Input
                  id="patient"
                  value={newAppointment.patient}
                  onChange={(e) => setNewAppointment({...newAppointment, patient: e.target.value})}
                  placeholder="Enter patient name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newAppointment.date}
                    onChange={(e) => setNewAppointment({...newAppointment, date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newAppointment.time}
                    onChange={(e) => setNewAppointment({...newAppointment, time: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Appointment Type</Label>
                <Input
                  id="type"
                  value={newAppointment.type}
                  onChange={(e) => setNewAppointment({...newAppointment, type: e.target.value})}
                  placeholder="e.g., Routine Checkup"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doctor">Doctor</Label>
                <Input
                  id="doctor"
                  value={newAppointment.doctor}
                  onChange={(e) => setNewAppointment({...newAppointment, doctor: e.target.value})}
                  placeholder="e.g., Dr. Smith"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={newAppointment.location}
                  onChange={(e) => setNewAppointment({...newAppointment, location: e.target.value})}
                  placeholder="e.g., Main Clinic - Room 203"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={newAppointment.phone}
                  onChange={(e) => setNewAppointment({...newAppointment, phone: e.target.value})}
                  placeholder="e.g., +1234567890"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateAppointment}>Create Appointment</Button>
            </div>
          </DialogContent>
        </Dialog>
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
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => handleCall(appointment.phone, appointment.patient)}>
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => handleMessage(appointment.patient)}>
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