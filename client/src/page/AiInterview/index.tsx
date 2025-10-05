import React, { Component } from "react";
import { useState } from "react";
import Header from "@/components/Header";

interface JobDetailsProps {
  jobId?: string;
}

export class index extends Component<JobDetailsProps> {  
  render() {
    const { jobId } = this.props;
    console.log("jobId_ai:", jobId);
    const[message, setMessage] = useState("");
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const startSession = async (sender:string, text: string){
       try: {
        // 2. Make the POST request using fetch
        const response = await fetch(
          "http://localhost:5000/api/interview/start",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              jobRole : 'xyz'
            }),
          });
        
        // 3. Handle the response
        if (!response.ok) {
          // Throw an error if the status code is not 2xx
          throw new Error(`HTTP error! status: ${response.status}`);
        }  
      }
      except: {
        const response = undefined;
      }

      let data = await response.json();

      

    }


    const sendMessage = async () => {
      if (!input.trim() || !sessionId || isLoading) return;

      const userMessage = input.trim();
      setInput(""); // Clear input field

      // 1. Immediately add user's message to the chat display
      onNewMessage({ sender: "user", text: userMessage });
      setIsLoading(true);

      try {
        // 2. Make the POST request using fetch
        const response = await fetch(
          "http://localhost:5000/api/interview/chat",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              sessionId: sessionId,
              message: userMessage,
            }),
          }
        );

        // 3. Handle the response
        if (!response.ok) {
          // Throw an error if the status code is not 2xx
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // 4. Add AI's message to the chat display
        onNewMessage({ sender: "ai", text: data.aiResponse });

        // (You'd also check data.isInterviewComplete here)
      } catch (error) {
        console.error("Error sending message:", error);
        // Optional: Display an error message in the chat
        onNewMessage({
          sender: "system",
          text: "Error: Could not connect to the AI interviewer.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <>
        <Header />
        <div>AI Interview Page: {jobId}</div>
        <div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button onClick={sendMessage} disabled={isLoading}>
            {isLoading ? "Sending..." : "Send"}
          </button>
        </div>
      </>
    );
  }
}

export default index;
