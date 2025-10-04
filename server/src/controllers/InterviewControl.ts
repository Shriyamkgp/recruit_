import * as readline from "readline/promises";
import { stdin as input, stdout as output } from "process";
import interviewAgent from "../agents/InterviewAgent.ts";
import textSummaryAgent from "../agents/SummaryMaker.ts";
import { readFileSync } from "fs";
import { writeFileSync } from "fs";

const savepath = "./database/chat_history.json";

let initial_prompt = readFileSync(
  "src/prompt/interview_prompt_v1.txt",
  "utf-8"
);
let summary_prompt = readFileSync("src/prompt/summary_prompt_v1.txt", "utf-8");
let jd_extract = readFileSync(
  "public/extracted_text/Job_Description.txt",
  "utf-8"
);
let resume_extract = readFileSync(
  "public/extracted_text/Resume_Sample.txt",
  "utf-8"
);

export async function mainagentI(name: string, salary_expectation: string) {
  // Step 1: Define your file path
  const filePath = "./public/sample_resume.pdf";

  // Step 2: Extract text from the PDF file

  // Step 3: Summarize the extracted text
  let job_description = await textSummaryAgent(
    summary_prompt + "\n" + jd_extract
  );
  let resume = await textSummaryAgent(summary_prompt + "\n" + resume_extract);

  //For Trial:
  name = "John Doe";
  salary_expectation = "$70,000 - $90,000 annually";

  // Modify the prompt to include extracted text
  initial_prompt += `
        Context:
            1.  Job Description (JD): ${job_description};
            2.  Candidate Resume: ${resume};

        Additional Information (may not be used in the interview):
            Name: ${name};
            Salary Expectation: ${salary_expectation}; 			
  `;

  let question = await interviewAgent(
    initial_prompt + `\n Generate the first Question.\n`
  );

  let answer = "";
  let isTerminated = false;
  const rl = readline.createInterface({ input, output });
  let count: number = 1;

  //initialize chat history
  let chatHistory: any[] = [
    {
      role: "system",
      parts: [
        {
          text: `${initial_prompt}`,
        },
      ],
    },
  ];

  chatHistory.push({
    role: "agent",
    parts: [
      {
        text: `Question Number: ${String(count)}:${question}`,
      },
    ],
  });

  count = 2; //max questions
  console.log("Virtual Interview------------------\n");

  while (!isTerminated && count < 11) {
    console.log(`Agent: ${question}`);
    const userPrompt = await rl.question("You: ");
    const userText = userPrompt.trim();

    if (userText.length === 0) continue;

    if (
      userText.toLowerCase().includes("terminate") ||
      userText.toLowerCase().includes("stop") ||
      userText.toLowerCase() === "exit"
    ) {
      isTerminated = true;
      console.log("\n--- Termination Requested ---");
      chatHistory.push({
        role: "user",
        parts: [
          {
            text: `The candidate requested to terminate the interview with the message: "${userText}"`,
          },
        ],
      });
    } else {
      chatHistory.push({ role: "user", parts: [{ text: userText }] });
    }

    // prepare history string for agent

    const historyString = chatHistory
      .map((historyItem) => {
        const role = historyItem.role.toUpperCase();
        const textContent = historyItem.parts
          .map((part: any) => part.text)
          .join(" ");
        return `--- ${role} ---\n${textContent}\n`;
      })
      .join("\n");

    //get next question
    question = await interviewAgent(
      historyString +
        `\n Based on the above answer and instructions, generate the next Question. (do not mention the question number)\n`
    );
    chatHistory.push({
      role: "agent",
      parts: [
        {
          text: `Question Number: ${String(count)}: ${question}`,
        },
      ],
    });
    count += 1;
  }
  rl.close();
}

export async function startAgent(name: string, salary_expectation: string) {
  // Step 3: Summarize the extracted text
  let job_description = await textSummaryAgent(
    summary_prompt + "\n" + jd_extract
  );
  let resume = await textSummaryAgent(summary_prompt + "\n" + resume_extract);

  //For Trial:
  name = "John Doe";
  salary_expectation = "$70,000 - $90,000 annually";

  // Modify the prompt to include extracted text
  initial_prompt += `
        Context:
            1.  Job Description (JD): ${job_description};
            2.  Candidate Resume: ${resume};

        Additional Information (may not be used in the interview):
            Name: ${name};
            Salary Expectation: ${salary_expectation}; 			
  `;

  let question = await interviewAgent(
    initial_prompt + `\n Generate the first Question.\n`
  );

  //initialize chat history
  let chatHistory: any[] = [
    {
      role: "system",
      parts: [
        {
          text: `${initial_prompt}`,
        },
      ],
    },
  ];

  chatHistory.push({
    role: "agent",
    parts: [
      {
        text: `Question Number: 1}:${question}`,
      },
    ],
  });

  try {
    writeFileSync(savepath, JSON.stringify(chatHistory, null, 2), "utf-8");
    console.log(`Chat history saved to ${savepath}`);
  } catch (error) {
    console.error("Error saving chat history:", error);
  }

  return question;
}

export async function processAgentI(sessionId: number, message: string) {
  try {
    // Load chat history from file
    const chatHistory = JSON.parse(readFileSync(savepath, "utf-8"));

    // Prepare history string for agent
    const historyString = chatHistory
      .map((historyItem: any) => {
        const role = historyItem.role.toUpperCase();
        const textContent = historyItem.parts
          .map((part: any) => part.text)
          .join(" ");
        return `--- ${role} ---\n${textContent}\n`;
      })
      .join("\n");

    // Generate next question based on chat history
    const nextQuestion = await interviewAgent(
      historyString +
        `\n Based on the above answer and instructions, generate the next Question. (do not mention the question number)\n`
    );

    // Update chat history with user message and agent question
    chatHistory.push({ role: "user", parts: [{ text: message }] });
    chatHistory.push({
      role: "agent",
      parts: [
        {
          text: `Question Number: : ${nextQuestion}`,
        },
      ],
    });
    // Save updated chat history back to file
    try {
      writeFileSync(savepath, JSON.stringify(chatHistory, null, 2), "utf-8");
      console.log(`Chat history saved to ${savepath}`);
    } catch (error) {
      console.error("Error saving chat history:", error);
    }

    return nextQuestion;
  } catch (error) {
    console.error("Error loading chat history:", error);
    return null;
  }
}

export class AI_Interviewer {
  static async start(sessionId: number, JobRole: string) {
    // Initialize the interview session
    const firstQuestion = await startAgent(
      "John Doe",
      "$70,000 - $90,000 annually"
    );
    return { firstQuestion };
  }

  static async processAgent(sessionId: number, message: string) {
    // Process the user's message and generate a response
    // For simplicity, we'll just echo the message back with a prefix
    const aiResponse = await processAgentI(sessionId, message);
    const isComplete = aiResponse
      ? aiResponse.toLowerCase().includes("conclusion")
      : false;
    return { aiResponse, isComplete };
  }
}

// mainagentI("John Doe", "$70,000 - $90,000 annually").catch((err) =>
//   console.error(err)
// );
