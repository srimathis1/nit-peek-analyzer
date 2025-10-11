"use client";

import React, { useState, useRef } from "react";
import { Mic, PhoneOff } from "lucide-react";

// ✅ Replace this with your real Hugging Face token
const HF_API_KEY = "hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";

export default function VoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<
    { role: string; content: string }[]
  >([]);
  const isInCallRef = useRef(false);

  // 🎙️ SpeechRecognition setup
  const SpeechRecognition =
    window.SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = "en-US";

  // 🔊 Speak text aloud
  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      if (isInCallRef.current) {
        setTimeout(() => startListening(), 800);
      }
    };
    speechSynthesis.speak(utterance);
  };

  // 🧠 Ask AI through Hugging Face
  const askAI = async (message: string) => {
    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${HF_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: `${conversationHistory
              .map((m) => `${m.role}: ${m.content}`)
              .join("\n")}\nuser: ${message}\nassistant:`,
            parameters: { max_new_tokens: 150 },
          }),
        }
      );

      const result = await response.json();
      console.log("HF result:", result);

      const aiReply =
        result?.[0]?.generated_text?.split("assistant:").pop()?.trim() ||
        "I'm here. Please continue.";

      setConversationHistory((prev) => [
        ...prev,
        { role: "assistant", content: aiReply },
      ]);
      speak(aiReply);
    } catch (err) {
      console.error("AI fetch error:", err);
      speak("Sorry, something went wrong. Please try again.");
    }
  };

  // 🗣️ Start listening
  const startListening = () => {
    if (!isInCallRef.current) return;

    try {
      recognition.start();
      setIsListening(true);
      console.log("Listening...");
    } catch (err) {
      console.warn("Recognizer start error:", err);
    }
  };

  // 🔁 Recognition events
  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;
    console.log("Heard:", transcript);

    setConversationHistory((prev) => [
      ...prev,
      { role: "user", content: transcript },
    ]);
    setIsListening(false);
    recognition.stop();
    askAI(transcript);
  };

  recognition.onerror = (e: any) => {
    console.error("Speech error:", e.error);
    setIsListening(false);
    if (isInCallRef.current && !isSpeaking) {
      setTimeout(() => startListening(), 1500);
    }
  };

  recognition.onend = () => {
    console.log("Recognition ended");
    setIsListening(false);
    if (isInCallRef.current && !isSpeaking) {
      setTimeout(() => startListening(), 1000);
    }
  };

  // 📞 Start or stop call
  const toggleCall = () => {
    if (isInCall) {
      isInCallRef.current = false;
      setIsInCall(false);
      recognition.stop();
      speechSynthesis.cancel();
      setIsListening(false);
      setIsSpeaking(false);
      console.log("Call ended");
    } else {
      isInCallRef.current = true;
      setIsInCall(true);
      setConversationHistory([]);
      console.log("Call started");
      startListening();
      speak("Hello, I am your AI companion. How are you today?");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white">
      <div
        className={`relative flex items-center justify-center w-48 h-48 rounded-full transition-all ${
          isListening ? "bg-green-500/20 scale-110" : "bg-gray-700/20"
        }`}
      >
        {isInCall ? (
          <button
            onClick={toggleCall}
            className="absolute w-20 h-20 bg-red-600 rounded-full flex items-center justify-center text-white hover:bg-red-700 transition-all"
          >
            <PhoneOff size={32} />
          </button>
        ) : (
          <button
            onClick={toggleCall}
            className="absolute w-20 h-20 bg-green-600 rounded-full flex items-center justify-center text-white hover:bg-green-700 transition-all"
          >
            <Mic size={32} />
          </button>
        )}
      </div>

      <div className="mt-8 text-center">
        {isInCall ? (
          <>
            {isSpeaking && <p>🗣️ Speaking...</p>}
            {isListening && !isSpeaking && <p>🎧 Listening...</p>}
            {!isListening && !isSpeaking && <p>💬 Thinking...</p>}
          </>
        ) : (
          <p>Press the mic to start talking</p>
        )}
      </div>

      {/* 🧠 Conversation Log */}
      <div className="mt-10 max-w-lg w-full bg-gray-900 p-4 rounded-2xl overflow-y-auto h-64">
        {conversationHistory.map((m, i) => (
          <p key={i} className="mb-2 text-sm">
            <span className={m.role === "user" ? "text-blue-400" : "text-green-400"}>
              {m.role}:
            </span>{" "}
            {m.content}
          </p>
        ))}
      </div>
    </div>
  );
}
