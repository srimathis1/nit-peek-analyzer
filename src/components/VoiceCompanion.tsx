import { useState, useRef } from "react";
import { Phone, PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const VoiceCompanion = () => {
  const [isInCall, setIsInCall] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  const { toast } = useToast();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Browser TTS fallback without API key
  const speakWithWebSpeech = (text: string) =>
    new Promise<void>((resolve) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        resolve();
        return;
      }
      setIsSpeaking(true);
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = navigator.language || 'en-US';
      utter.rate = 1;
      utter.pitch = 1;
      utter.onend = () => {
        setIsSpeaking(false);
        resolve();
      };
      utter.onerror = () => {
        setIsSpeaking(false);
        resolve();
      };
      window.speechSynthesis.speak(utter);
    });

  const startCall = async () => {
    try {
      setIsInCall(true);
      setConversationHistory([]);
      
      toast({
        title: "Call Connected",
        description: "Your companion is ready to talk with you",
      });

      // Start with a warm greeting
      await processAIResponse("Hello! It's wonderful to hear from you. How are you feeling today?", []);
      
      // Auto-start listening after greeting plays
      setTimeout(() => {
        if (isInCall) {
          startListening();
        }
      }, 3000);
    } catch (error) {
      console.error('Error starting call:', error);
      toast({
        title: "Error",
        description: "Could not start call",
        variant: "destructive",
      });
    }
  };

  const endCall = () => {
    // Stop any ongoing recording
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    
    setIsInCall(false);
    setIsListening(false);
    setIsSpeaking(false);
    setCurrentMessage("");
    setConversationHistory([]);
    
    toast({
      title: "Call Ended",
      description: "Take care! Call anytime you need someone to talk to.",
    });
  };

  const startListening = async () => {
    if (!isInCall) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsListening(true);
      setCurrentMessage("Listening...");
      
      // Auto-stop after 10 seconds for natural conversation flow
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
          setIsListening(false);
        }
      }, 10000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Error",
        description: "Could not access microphone",
        variant: "destructive",
      });
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    if (!isInCall) return;
    
    try {
      setCurrentMessage("Processing your message...");
      
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        const base64Audio = reader.result?.toString().split(',')[1];
        
        console.log('Starting transcription...');
        
        // Transcribe user's voice
        const { data: transcriptionData, error: transcriptionError } = await supabase.functions.invoke(
          'voice-to-text',
          { body: { audio: base64Audio } }
        );

        if (transcriptionError) {
          console.error('Transcription error:', transcriptionError);
          setCurrentMessage("Sorry, I couldn't hear that clearly. Please try again.");
          setTimeout(() => {
            if (isInCall) startListening();
          }, 2000);
          return;
        }

        console.log('Transcription result:', transcriptionData);
        const userMessage = transcriptionData?.text;
        
        if (!userMessage || userMessage.trim().length === 0) {
          console.log('No speech detected, restarting listening');
          setTimeout(() => {
            if (isInCall) startListening();
          }, 1000);
          return;
        }
        
        setCurrentMessage(`You: ${userMessage}`);
        
        // Add to conversation history
        const updatedHistory = [...conversationHistory, { role: 'user' as const, content: userMessage }];
        setConversationHistory(updatedHistory);

        console.log('Getting AI response...');
        
        // Get AI response with conversation context
        const { data: aiData, error: aiError } = await supabase.functions.invoke(
          'elder-companion',
          { 
            body: { 
              message: userMessage,
              conversationHistory: updatedHistory
            }
          }
        );

        if (aiError) {
          console.error('AI error:', aiError);
          setCurrentMessage("Sorry, I'm having trouble thinking right now. Let me try again.");
          setTimeout(() => {
            if (isInCall) startListening();
          }, 2000);
          return;
        }

        console.log('AI response:', aiData);
        const aiResponse = aiData?.response;
        await processAIResponse(aiResponse, updatedHistory);
      };
    } catch (error) {
      console.error('Error processing audio:', error);
      setCurrentMessage("Sorry, I couldn't understand that. Could you say that again?");
      toast({
        title: "Error",
        description: "Failed to process your message",
        variant: "destructive",
      });
      
      // Auto-restart listening after error
      setTimeout(() => {
        if (isInCall) {
          startListening();
        }
      }, 2000);
    }
  };

  const processAIResponse = async (aiResponse: string, history: Message[]) => {
    if (!isInCall) return;
    
    try {
      console.log('Processing AI response:', aiResponse);
      setCurrentMessage(`Companion: ${aiResponse}`);
      
      // Add AI response to history
      setConversationHistory([...history, { role: 'assistant' as const, content: aiResponse }]);

      console.log('Converting to speech...');
      
      // Convert to speech
      const { data: ttsData, error: ttsError } = await supabase.functions.invoke(
        'text-to-speech',
        { body: { text: aiResponse, voice: 'nova' } }
      );

      if (ttsError) {
        console.error('TTS error, using browser voice fallback:', ttsError);
        await speakWithWebSpeech(aiResponse);
        setTimeout(() => {
          if (isInCall) startListening();
        }, 500);
        return;
      }

      console.log('Speech generated, playing audio...');

      // Play audio
      setIsSpeaking(true);
      
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      
      const audioData = atob(ttsData.audioContent);
      const arrayBuffer = new ArrayBuffer(audioData.length);
      const view = new Uint8Array(arrayBuffer);
      for (let i = 0; i < audioData.length; i++) {
        view[i] = audioData.charCodeAt(i);
      }

      const audioBlob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.onerror = async (e) => {
        console.error('Audio playback error, using browser voice fallback:', e);
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        await speakWithWebSpeech(aiResponse);
        setTimeout(() => {
          if (isInCall) startListening();
        }, 500);
      };

      audio.onended = () => {
        console.log('Audio playback completed');
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        
        // Auto-start listening for next response after a short pause
        setTimeout(() => {
          if (isInCall) {
            console.log('Restarting listening...');
            startListening();
          }
        }, 1000);
      };

      await audio.play();
      console.log('Audio playing...');
    } catch (error) {
      console.error('Error in AI response:', error);
      setIsSpeaking(false);
      
      toast({
        title: "Error",
        description: "Failed to generate voice response",
        variant: "destructive",
      });
      
      // Try to continue conversation even after error
      setTimeout(() => {
        if (isInCall) {
          startListening();
        }
      }, 2000);
    }
  };

  return (
    <Card className="fixed bottom-6 right-6 w-80 shadow-elevated border-primary/20 z-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              isSpeaking ? 'bg-green-500 animate-pulse' : 
              isListening ? 'bg-blue-500 animate-pulse' : 
              isInCall ? 'bg-yellow-500' : 
              'bg-muted'
            }`} />
            <span className="font-medium text-sm">
              {isInCall ? 'On Call' : 'Voice Companion'}
            </span>
          </div>
        </div>
        
        {currentMessage && (
          <div className="mb-3 p-3 bg-muted/50 rounded-lg min-h-[60px]">
            <p className="text-xs text-foreground">
              {currentMessage}
            </p>
          </div>
        )}

        <div className="flex gap-2">
          {!isInCall ? (
            <Button
              onClick={startCall}
              className="flex-1 bg-gradient-medical text-primary-foreground"
            >
              <Phone className="w-4 h-4 mr-2" />
              Start Call
            </Button>
          ) : (
            <Button
              onClick={endCall}
              variant="destructive"
              className="flex-1"
            >
              <PhoneOff className="w-4 h-4 mr-2" />
              End Call
            </Button>
          )}
        </div>
        
        <p className="text-xs text-muted-foreground mt-3 text-center">
          {isInCall 
            ? "Speak naturally - I'm here to listen and talk with you" 
            : "Call anytime you need someone to talk to"}
        </p>
      </CardContent>
    </Card>
  );
};