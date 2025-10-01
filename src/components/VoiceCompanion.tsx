import { useState, useRef } from "react";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const VoiceCompanion = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const { toast } = useToast();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsListening(true);
      
      toast({
        title: "Listening...",
        description: "Speak to your elder companion",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not access microphone",
        variant: "destructive",
      });
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    try {
      // Convert audio to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result?.toString().split(',')[1];
        
        // Transcribe audio
        const { data: transcriptionData, error: transcriptionError } = await supabase.functions.invoke(
          'voice-to-text',
          { body: { audio: base64Audio } }
        );

        if (transcriptionError) throw transcriptionError;

        const userText = transcriptionData.text;
        setTranscript(userText);

        // Get AI response
        const { data: aiData, error: aiError } = await supabase.functions.invoke(
          'elder-companion',
          { body: { message: userText } }
        );

        if (aiError) throw aiError;

        const aiResponse = aiData.response;

        // Convert response to speech
        const { data: ttsData, error: ttsError } = await supabase.functions.invoke(
          'text-to-speech',
          { body: { text: aiResponse, voice: 'nova' } }
        );

        if (ttsError) throw ttsError;

        // Play audio response
        const audioData = atob(ttsData.audioContent);
        const arrayBuffer = new ArrayBuffer(audioData.length);
        const view = new Uint8Array(arrayBuffer);
        for (let i = 0; i < audioData.length; i++) {
          view[i] = audioData.charCodeAt(i);
        }

        const audioBlob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);

        setIsSpeaking(true);
        audio.onended = () => setIsSpeaking(false);
        await audio.play();

        toast({
          title: "Companion Response",
          description: aiResponse,
        });
      };
    } catch (error) {
      console.error('Error processing audio:', error);
      toast({
        title: "Error",
        description: "Failed to process your message",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="fixed bottom-6 right-6 w-80 shadow-elevated border-primary/20 z-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isSpeaking ? 'bg-primary animate-pulse' : 'bg-muted'}`} />
            <span className="font-medium text-sm">Elder Companion</span>
          </div>
          {isSpeaking && <Volume2 className="w-4 h-4 text-primary animate-pulse" />}
        </div>
        
        {transcript && (
          <div className="mb-3 p-2 bg-muted rounded text-xs">
            <p className="text-muted-foreground">You said:</p>
            <p className="text-foreground">{transcript}</p>
          </div>
        )}

        <div className="flex gap-2">
          {!isListening ? (
            <Button
              onClick={startListening}
              className="flex-1 bg-gradient-medical text-primary-foreground"
              disabled={isSpeaking}
            >
              <Mic className="w-4 h-4 mr-2" />
              Talk to Companion
            </Button>
          ) : (
            <Button
              onClick={stopListening}
              variant="destructive"
              className="flex-1"
            >
              <MicOff className="w-4 h-4 mr-2" />
              Stop Listening
            </Button>
          )}
        </div>
        
        <p className="text-xs text-muted-foreground mt-3 text-center">
          Your AI companion is here to chat and keep you company
        </p>
      </CardContent>
    </Card>
  );
};
