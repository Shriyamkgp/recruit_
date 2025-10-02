import * as readline from "readline/promises";
import { stdin as input, stdout as output } from "process";
import interviewAgent from "../agents/InterviewAgent.js";
import textSummaryAgent from "../agents/SummaryMaker.js";

import { readFileSync } from "fs";

let initial_prompt = readFileSync(
  "src/prompt/interview_prompt_v1.txt",
  "utf-8"
);

let summary_prompt = readFileSync("src/prompt/summary_prompt_v1.txt", "utf-8");

let jd_extract = readFileSync(
  "../../public/extracted_text/Job_Description.txt",
  "utf-8"
);

let resume_extract = readFileSync(
  "../../public/extracted_text/Resume_Sample.txt",
  "utf-8"
);

async function main() {
  // Resume Summary and JD Summary

  // Step 1: Define your file path
  const filePath = "./public/sample_resume.pdf";

  // Step 2: Extract text from the PDF file

  // Step 3: Summarize the extracted text
  let job_description = textSummaryAgent(summary_prompt + "\n" + jd_extract);
  let resume = textSummaryAgent(summary_prompt + "\n" + resume_extract);
  console.log("Job Description Summary: ", job_description);
  console.log("Resume Summary: ", resume);

  // Modify the prompt	to include extracted text

  let candidates_names = "Takanori Ito";
  let salary_expectation = "$80,000 - $100,000 annually";

  initial_prompt += `
				Context:
							1.  Job Description (JD): ${job_description};
							2.  Candidate Resume: ${resume};

				Additional	Information (may not be used in the interview):
									Name: ${candidates_names};
									Salary Expectation: ${salary_expectation}; 			
                  `;

  let question = await interviewAgent(
    initial_prompt + `\n Generate the first Question.\n`
  ); //first question
  let chatHistory = [];
  let answer = "";
  let isTerminated = false;
  const rl = readline.createInterface({ input, output });
  let count: number = 1;
  chatHistory.push(initial_prompt);
  chatHistory.push({
    role: "system",
    parts: [
      {
        text: `Question Number: ${String(count)}:${question}`,
      },
    ],
  });
  count = 2; //max questions
  console.log("Starting Interview Agent...");
  while (!isTerminated || count < 11) {
    console.log(question);
    // get answer from user (through API)
    // answer = await getAnswerFromUser();
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
      // The next API call will generate the final closing statement due to the system prompt
    } else {
      // Add user message to history
      chatHistory.push({ role: "user", parts: [{ text: userText }] });
    }

    // get next question from agent (through API)
    let chat_history = chatHistory.join("\n");
    question = await interviewAgent(
      chat_history + `\n Based on the above, generate the next Question.\n`
    );
    chatHistory.push({
      role: "system",
      parts: [
        {
          text: `Question Number: ${String(count)}: ${question}`,
        },
      ],
    });
    count += 1;
  }

  console.log(chatHistory.join("\n"));
  rl.close();
}

main().catch((err) => console.error(err));
