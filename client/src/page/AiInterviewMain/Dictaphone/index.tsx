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

  // Ref to hold the ID of the 20-second absolute timer
  const absoluteTimeoutRef = useRef<number | null>(null);

  // Ref to hold the LATEST value of the transcript
  const latestTranscriptRef = useRef(transcript);

  // Update the ref whenever the transcript changes (runs on every transcription update)
  useEffect(() => {
    latestTranscriptRef.current = transcript;
  }, [transcript]);

  // Memoize stopAndReport using useCallback.
  // This function is stable unless onTranscriptChange changes.
  const stopAndReport = useCallback(
    (finalTranscript: string) => {
      console.log("Stopping speech to text");

      // 1. Manually stop the browser recognition session
      SpeechRecognition.stopListening();

      // 2. Report the final transcript
      onTranscriptChange(finalTranscript, true);

      // 3. Cleanup the absolute timer ref
      if (absoluteTimeoutRef.current !== null) {
        clearTimeout(absoluteTimeoutRef.current);
        absoluteTimeoutRef.current = null;
      }
    },
    [onTranscriptChange]
  ); // onTranscriptChange is a stable prop from the parent component

  // Main effect to START listening when the component mounts
  useEffect(() => {
    if (!browserSupportsSpeechRecognition) return;

    // 1. Ensure listening starts (This runs on mount for both question 1 and subsequent questions)
    console.log("Starting Dictaphone listening session...");
    SpeechRecognition.startListening({
      continuous: true,
      interimResults: true,
    });

    // 2. SET THE 20-SECOND ABSOLUTE TIMER
    const timerId = setTimeout(() => {
      // console.log("Absolute 20-second limit reached. Stopping recognition.");

      // ✅ FIX: Use the ref to access the LATEST transcript value,
      // avoiding the stale closure bug.
      stopAndReport(latestTranscriptRef.current);
    }, 30000);

    absoluteTimeoutRef.current = timerId;

    // Cleanup function: stop listening and clear the timer when unmounting
    return () => {
      console.log("Cleaning up Dictaphone session...");
      SpeechRecognition.stopListening();
      if (absoluteTimeoutRef.current !== null) {
        clearTimeout(absoluteTimeoutRef.current);
        absoluteTimeoutRef.current = null;
      }
    };
  }, [browserSupportsSpeechRecognition, stopAndReport]); // Added stopAndReport to dependencies

  // Effect to report live transcript updates (this remains the same)
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
