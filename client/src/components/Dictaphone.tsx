import React, { useEffect, useRef, useCallback } from "react";

import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

interface AutoSpeechInputProps {
  onTranscriptChange: (transcript: string, final: boolean) => void;
}

const Dictaphone = ({ onTranscriptChange }: AutoSpeechInputProps) => {
  const { transcript, browserSupportsSpeechRecognition } =
    useSpeechRecognition();

  const absoluteTimeoutRef = useRef<number | null>(null);

  const latestTranscriptRef = useRef(transcript);

  useEffect(() => {
    latestTranscriptRef.current = transcript;
  }, [transcript]);

  const stopAndReport = useCallback(
    (finalTranscript: string) => {
      console.log("Stopping speech to text");

      SpeechRecognition.stopListening();

      onTranscriptChange(finalTranscript, true);

      if (absoluteTimeoutRef.current !== null) {
        clearTimeout(absoluteTimeoutRef.current);

        absoluteTimeoutRef.current = null;
      }
    },

    [onTranscriptChange]
  );

  useEffect(() => {
    if (!browserSupportsSpeechRecognition) return;

    console.log("Starting Dictaphone listening session...");

    SpeechRecognition.startListening({
      continuous: true,

      interimResults: true,
    });

    const timerId = setTimeout(() => {
      stopAndReport(latestTranscriptRef.current);
    }, 10000);

    absoluteTimeoutRef.current = timerId;

    return () => {
      console.log("Cleaning up Dictaphone session...");

      SpeechRecognition.stopListening();

      if (absoluteTimeoutRef.current !== null) {
        clearTimeout(absoluteTimeoutRef.current);

        absoluteTimeoutRef.current = null;
      }
    };
  }, [browserSupportsSpeechRecognition, stopAndReport]);

  useEffect(() => {
    if (transcript) {
      onTranscriptChange(transcript, false);
    }
  }, [transcript, onTranscriptChange]);

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  return <div></div>;
};

export default Dictaphone;
