import React, { useEffect } from "react";
import { useSpeech } from "react-text-to-speech";

interface props {
  text_input: string;
  onSpeechComplete: () => void;
}

export default function AgentVoice({ text_input, onSpeechComplete }: props) {
  const { start, stop } = useSpeech({
    text: text_input,
  });

  useEffect(() => {
    let timerId: number | undefined;
    let timeoutToStartId: number | undefined;

    if (text_input && text_input.trim().length > 0) {
      console.log(`TTS starting for: ${text_input.substring(0, 30)}...`);

      // 1. Start the TTS speech
      timeoutToStartId = setTimeout(() => {
        start();
      }, 1000);

      // 2. Set the 8-second timeout
      const TIMEOUT_MS = 15000;

      timerId = setTimeout(() => {
        console.log("TTS Timeout: 8 seconds reached.");
        stop();
        onSpeechComplete();
      }, TIMEOUT_MS) as unknown as number;
    }

    // 3. Cleanup Function
    return () => {
      console.log("TTS Cleanup: Clearing timer and stopping speech.");
      if (timerId) {
        clearTimeout(timerId);
      }
      if (timeoutToStartId) {
        clearTimeout(timeoutToStartId);
      }
      stop();
    };
  }, [text_input]);

  return <div className="hidden"></div>;
}
