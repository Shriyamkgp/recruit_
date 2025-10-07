import React, { useEffect } from "react";
import { useSpeech } from "react-text-to-speech";

interface props {
  text_input: string;
  onSpeechComplete: () => void;
}

export default function AgentVoice({ text_input, onSpeechComplete }: props) {
  const { start, stop } = useSpeech({
    text: text_input,
    onStop: onSpeechComplete,
  });

  useEffect(() => {
    if (text_input && text_input.trim().length > 0) {
      console.log(`TTS starting for: ${text_input.substring(0, 30)}...`);
      start();
    }

    return () => {
      console.log("TTS Cleanup: Stopping any ongoing speech.");
      stop();
    };
  }, [text_input, start, stop]);

  return <div className="hidden"></div>;
}
