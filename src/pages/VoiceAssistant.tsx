import { useState, useRef } from "react";
import { Phone, PhoneOff, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function VoiceAssistant() {
  const [isInCall, setIsInCall] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  const { toast } = useToast();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);

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

      await processAIResponse("Hello! It's wonderful to hear from you. How are you feeling today?", []);
      
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
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
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

        const userMessage = transcriptionData?.text;
        
        if (!userMessage || userMessage.trim().length === 0) {
          setTimeout(() => {
            if (isInCall) startListening();
          }, 1000);
          return;
        }
        
        setCurrentMessage(`You: ${userMessage}`);
        
        const updatedHistory = [...conversationHistory, { role: 'user' as const, content: userMessage }];
        setConversationHistory(updatedHistory);
        
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

        const aiResponse = aiData?.response;
        await processAIResponse(aiResponse, updatedHistory);
      };
    } catch (error) {
      console.error('Error processing audio:', error);
      setCurrentMessage("Sorry, I couldn't understand that. Could you say that again?");
      
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
      setCurrentMessage(`Companion: ${aiResponse}`);
      
      setConversationHistory([...history, { role: 'assistant' as const, content: aiResponse }]);
      
      // Prefer browser TTS for zero-dependency voice
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        await speakWithWebSpeech(aiResponse);
        setTimeout(() => {
          if (isInCall) startListening();
        }, 500);
        return;
      }

      const { data: ttsData, error: ttsError } = await supabase.functions.invoke(
        'text-to-speech',
        { body: { text: aiResponse, voice: 'nova' } }
      );

      if (ttsError || !ttsData?.audioContent) {
        console.error('TTS error, using browser voice fallback:', ttsError);
        await speakWithWebSpeech(aiResponse);
        setTimeout(() => {
          if (isInCall) startListening();
        }, 500);
        return;
      }

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
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        
        setTimeout(() => {
          if (isInCall) {
            startListening();
          }
        }, 1000);
      };

      await audio.play();
    } catch (error) {
      console.error('Error in AI response:', error);
      setIsSpeaking(false);
      
      setTimeout(() => {
        if (isInCall) {
          startListening();
        }
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="w-6 h-6 text-primary" />
              Voice Assistant
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-center">
              <div className={`w-32 h-32 rounded-full flex items-center justify-center ${
                isSpeaking ? 'bg-green-500/20 animate-pulse' : 
                isListening ? 'bg-blue-500/20 animate-pulse' : 
                isInCall ? 'bg-yellow-500/20' : 
                'bg-muted'
              }`}>
                <Mic className={`w-16 h-16 ${
                  isSpeaking ? 'text-green-500' : 
                  isListening ? 'text-blue-500' : 
                  isInCall ? 'text-yellow-500' : 
                  'text-muted-foreground'
                }`} />
              </div>
            </div>

            <div className="text-center">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                isSpeaking ? 'bg-green-500/10 text-green-500' : 
                isListening ? 'bg-blue-500/10 text-blue-500' : 
                isInCall ? 'bg-yellow-500/10 text-yellow-500' : 
                'bg-muted text-muted-foreground'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  isSpeaking ? 'bg-green-500 animate-pulse' : 
                  isListening ? 'bg-blue-500 animate-pulse' : 
                  isInCall ? 'bg-yellow-500' : 
                  'bg-muted-foreground'
                }`} />
                <span className="font-medium text-sm">
                  {isSpeaking ? 'Speaking' : isListening ? 'Listening' : isInCall ? 'On Call' : 'Ready to Call'}
                </span>
              </div>
            </div>
            
            {currentMessage && (
              <div className="p-4 bg-muted/50 rounded-lg min-h-[100px]">
                <p className="text-sm text-foreground">
                  {currentMessage}
                </p>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              {!isInCall ? (
                <Button
                  onClick={startCall}
                  size="lg"
                  className="bg-gradient-medical text-primary-foreground px-8"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Start Voice Call
                </Button>
              ) : (
                <Button
                  onClick={endCall}
                  variant="destructive"
                  size="lg"
                  className="px-8"
                >
                  <PhoneOff className="w-5 h-5 mr-2" />
                  End Call
                </Button>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground text-center">
              {isInCall 
                ? "Speak naturally - Your companion is here to listen and talk with you" 
                : "Start a voice call to have a natural conversation with your AI companion"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
