import React, { useEffect } from "react";
import { useSpeech } from "react-text-to-speech";

interface props {
  text_input: string;
  onSpeechComplete: () => void;
}

export default function TextToSpeech({ text_input, onSpeechComplete }: props) {
  const {
    start, // Function to start the speech
  } = useSpeech({ text: text_input, onStop: onSpeechComplete });

  // 1. Wrap the function call in useEffect
  useEffect(() => {
    // 2. Add the robust check for text content
    if (text_input && text_input.trim().length > 0) {
      start();
    }

    // 3. Define dependencies: Rerun only when text_input changes
  }, [text_input, start, onSpeechComplete]);

  return <div></div>;
}
