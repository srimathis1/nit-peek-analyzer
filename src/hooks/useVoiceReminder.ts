import { useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

// Simple browser-based voice reminders using the Web Speech API (no API key)
// Schedule messages to be spoken at specific Date times. Group by id for easy cancel.

export interface VoiceReminderItem {
  at: Date;
  message: string;
}

export function useVoiceReminder() {
  const timersRef = useRef<Map<string, number[]>>(new Map());
  const { toast } = useToast();

  const speak = (text: string) => {
    if (typeof window === "undefined") return;
    if (!("speechSynthesis" in window)) {
      toast({
        title: "Voice Unavailable",
        description: "Your browser doesn't support voice playback.",
        variant: "destructive",
      });
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.lang = navigator.language || "en-US";

    window.speechSynthesis.speak(utterance);
  };

  const scheduleReminders = (items: VoiceReminderItem[], groupId: string = "default") => {
    const valid = items.filter(i => i.at.getTime() > Date.now());
    if (valid.length === 0) {
      toast({ title: "No upcoming reminders today" });
      return;
    }
    const ids: number[] = [];
    valid.forEach(({ at, message }) => {
      const delay = at.getTime() - Date.now();
      const id = window.setTimeout(() => {
        speak(message);
        toast({ title: "Medication Reminder", description: message });
      }, delay);
      ids.push(id);
    });
    // store
    const current = timersRef.current.get(groupId) ?? [];
    timersRef.current.set(groupId, current.concat(ids));

    toast({
      title: "Voice reminders set",
      description: `${valid.length} reminder${valid.length > 1 ? "s" : ""} scheduled for today`,
    });
  };

  const cancelReminders = (groupId: string = "default") => {
    const ids = timersRef.current.get(groupId) || [];
    ids.forEach(clearTimeout);
    timersRef.current.delete(groupId);
    toast({ title: "Voice reminders cancelled" });
  };

  useEffect(() => {
    return () => {
      // cleanup all timers on unmount
      timersRef.current.forEach(ids => ids.forEach(clearTimeout));
      timersRef.current.clear();
    };
  }, []);

  return { scheduleReminders, cancelReminders };
}
