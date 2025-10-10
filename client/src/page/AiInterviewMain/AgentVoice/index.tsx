import React, { useEffect } from "react";
import { useSpeech } from "react-text-to-speech";

interface props {
  text_input: string;
  onSpeechComplete: () => void;
}

export default function AgentVoice({ text_input, onSpeechComplete }: props) {
  // Define the useSpeech hook. We still need onStop in case the speech is
  // naturally short (less than 8 seconds), but we'll control the timer.
  const { start, stop } = useSpeech({
    text: text_input,
  });

  useEffect(() => {
    let timerId: number | undefined;

    if (text_input && text_input.trim().length > 0) {
      console.log(`TTS starting for: ${text_input.substring(0, 30)}...`);

      // 1. Start the TTS speech
      start();

      // 2. Set the 8-second timeout
      const TIMEOUT_MS = 30000;

      timerId = setTimeout(() => {
        console.log("TTS Timeout: 8 seconds reached.");
        // Stop the ongoing speech
        stop();

        // Explicitly call the completion handler (optional if stop() calls onStop)
        // We call it here to ensure it runs even if onStop is buggy/unreliable.
        // It's safe to call it if onStop is also called, as it should be a simple trigger.
        onSpeechComplete();
      }, TIMEOUT_MS) as unknown as number; // Type casting for NodeJS/browser compatibility
    }

    // 3. Cleanup Function
    return () => {
      console.log("TTS Cleanup: Clearing timer and stopping speech.");

      // Clear the timeout to prevent it from firing if the component unmounts
      // or the text_input changes before 8 seconds.
      if (timerId) {
        clearTimeout(timerId);
      }

      // Always call stop() on cleanup to ensure any browser speech process is terminated.
      stop();
    };

    // Added onSpeechComplete to the dependency array, which is necessary because
    // it is used inside the timeout function.
  }, [text_input]);

  return <div className="hidden"></div>;
}
