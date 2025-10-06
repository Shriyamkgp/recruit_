import React, { useEffect, useRef, useCallback } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

interface AutoSpeechInputProps {
  onTranscriptChange: (transcript: string) => void;
}

const Dictaphone = ({ onTranscriptChange }: AutoSpeechInputProps) => {
  const {
    transcript,
    listening,
    // Include this for proper cleanup if the library exposes a 'stop' function that updates internal state
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const timeoutRef = useRef<number | null>(null);

  // Memoize the stop and report logic to ensure stability in the timeout
  const stopAndReport = useCallback(
    (finalTranscript: string) => {
      // 1. Manually stop the browser recognition session
      SpeechRecognition.stopListening();

      // 2. Report the final transcript to the parent component
      onTranscriptChange(finalTranscript);

      // 3. Clear the internal timer ref
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    },
    [onTranscriptChange]
  );

  // =========================================================================
  // EFFECT 1: Start Listening (Continuous Mode) & Component Cleanup
  // =========================================================================
  useEffect(() => {
    if (browserSupportsSpeechRecognition) {
      SpeechRecognition.startListening({
        continuous: true,
        interimResults: true,
      });
    }

    return () => {
      // Ensure everything is stopped/cleared when the component unmounts
      SpeechRecognition.stopListening();
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [browserSupportsSpeechRecognition]);

  // =========================================================================
  // EFFECT 2: Silence Detection and Timeout Logic
  // =========================================================================
  useEffect(() => {
    if (transcript && onTranscriptChange) {
      onTranscriptChange(transcript);
    }

    // Clear any existing timer before proceeding
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (!listening && transcript) {
      const timerId = setTimeout(() => {
        console.log(
          "5 seconds of silence detected. Stopping recognition and reporting final transcript."
        );
        // Use the memoized function to ensure stable reporting/cleanup
        stopAndReport(transcript);
      }, 3000);

      timeoutRef.current = timerId;
    }

    // Dependencies: We rely on the stable 'stopAndReport' function
  }, [listening, transcript, stopAndReport]);

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  return <div></div>;
};
export default Dictaphone;
