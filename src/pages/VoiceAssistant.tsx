import { useState, useEffect, useRef } from "react";
import { Phone, PhoneOff, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Browser-based Speech Recognition
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

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
  const recognitionRef = useRef<any>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (!SpeechRecognition) {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in this browser. Please use Chrome or Edge.",
        variant: "destructive",
      });
    }
  }, []);

  const speak = (text: string) => {
    return new Promise<void>((resolve) => {
      if (!('speechSynthesis' in window)) {
        resolve();
        return;
      }
      
      window.speechSynthesis.cancel(); // Cancel any ongoing speech
      setIsSpeaking(true);
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onend = () => {
        setIsSpeaking(false);
        resolve();
      };
      
      utterance.onerror = () => {
        setIsSpeaking(false);
        resolve();
      };
      
      window.speechSynthesis.speak(utterance);
    });
  };

  const startCall = async () => {
    if (!SpeechRecognition) {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in this browser",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsInCall(true);
      setConversationHistory([]);
      
      toast({
        title: "Call Connected",
        description: "Start speaking after the greeting!",
      });

      const greeting = "Hello! It's wonderful to hear from you. How are you feeling today?";
      setCurrentMessage(`Companion: ${greeting}`);
      
      await speak(greeting);
      
      // Start listening after greeting
      setTimeout(() => {
        if (isInCall) {
          startListening();
        }
      }, 500);
    } catch (error) {
      console.error('Error starting call:', error);
      toast({
        title: "Error",
        description: "Could not start call",
        variant: "destructive",
      });
      setIsInCall(false);
    }
  };

  const endCall = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.log('Recognition already stopped');
      }
    }
    
    window.speechSynthesis.cancel();
    
    setIsInCall(false);
    setIsListening(false);
    setIsSpeaking(false);
    setCurrentMessage("");
    
    toast({
      title: "Call Ended",
      description: "Take care! Call anytime you need someone to talk to.",
    });
  };

  const startListening = () => {
    if (!isInCall || !SpeechRecognition) return;
    
    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setCurrentMessage("Listening... Speak now!");
        console.log('Started listening...');
      };

      recognition.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log('Heard:', transcript);
        
        setIsListening(false);
        setCurrentMessage(`You: ${transcript}`);
        
        // Process the user's message
        await handleUserMessage(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Recognition error:', event.error);
        setIsListening(false);
        
        if (event.error === 'no-speech') {
          setCurrentMessage("I didn't hear anything. Try again!");
          setTimeout(() => {
            if (isInCall) startListening();
          }, 1500);
        } else {
          toast({
            title: "Error",
            description: "Could not understand. Please try again.",
            variant: "destructive",
          });
          setTimeout(() => {
            if (isInCall) startListening();
          }, 2000);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        console.log('Recognition ended');
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (error) {
      console.error('Error starting recognition:', error);
      toast({
        title: "Error",
        description: "Could not start listening",
        variant: "destructive",
      });
    }
  };

  const handleUserMessage = async (userMessage: string) => {
    if (!isInCall || !userMessage.trim()) return;
    
    try {
      setCurrentMessage("Thinking...");
      
      const updatedHistory = [...conversationHistory, { role: 'user' as const, content: userMessage }];
      setConversationHistory(updatedHistory);
      
      // Get AI response
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
        const fallbackResponse = "I'm here with you. Could you say that again?";
        setCurrentMessage(`Companion: ${fallbackResponse}`);
        await speak(fallbackResponse);
        
        setTimeout(() => {
          if (isInCall) startListening();
        }, 500);
        return;
      }

      const aiResponse = aiData?.response || "I'm listening. Please continue.";
      
      // Update conversation
      setConversationHistory([...updatedHistory, { role: 'assistant' as const, content: aiResponse }]);
      setCurrentMessage(`Companion: ${aiResponse}`);
      
      // Speak the response
      await speak(aiResponse);
      
      // Continue listening
      setTimeout(() => {
        if (isInCall) startListening();
      }, 500);
      
    } catch (error) {
      console.error('Error processing message:', error);
      const errorResponse = "Sorry, I had a moment there. What were you saying?";
      setCurrentMessage(`Companion: ${errorResponse}`);
      await speak(errorResponse);
      
      setTimeout(() => {
        if (isInCall) startListening();
      }, 500);
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
