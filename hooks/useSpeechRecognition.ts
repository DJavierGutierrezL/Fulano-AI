import { useState, useEffect, useRef } from 'react';

// Fix: Add type definitions for the Web Speech API, which are not included in standard TypeScript DOM typings.
// This resolves errors related to SpeechRecognition, SpeechRecognitionEvent, and SpeechRecognitionErrorEvent.
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionStatic {
  new(): SpeechRecognition;
}


declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionStatic;
    webkitSpeechRecognition: SpeechRecognitionStatic;
  }
}

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition: SpeechRecognition | null = null;
if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.lang = 'es-ES';
  recognition.interimResults = true;
}

export const useSpeechRecognition = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(recognition);

  useEffect(() => {
    const rec = recognitionRef.current;
    if (!rec) return;

    rec.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setTranscript(finalTranscript + interimTranscript);
    };

    rec.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Error de reconocimiento de voz:', event.error);
      if (isRecording) {
        setIsRecording(false);
      }
    };

    rec.onend = () => {
      if (isRecording) {
        setIsRecording(false);
      }
    };

    return () => {
      rec.stop();
    };
  }, [isRecording]);

  const startRecording = () => {
    if (recognitionRef.current && !isRecording) {
      setTranscript('');
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };
  
  const toggleRecording = () => {
    if (isRecording) {
        stopRecording();
    } else {
        startRecording();
    }
  };


  return { isRecording, transcript, toggleRecording, hasSpeechRecognition: !!recognitionRef.current };
};
