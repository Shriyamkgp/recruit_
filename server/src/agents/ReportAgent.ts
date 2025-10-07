import { InterviewSession, Report, Application } from "../models/index.ts";
import { genAI } from "./AIAgent.ts";

// --- Generate Interview Report ---
export const generateInterviewReport = async (sessionId: string) => {
  try {
    const session = await InterviewSession.findById(sessionId)
      .populate("applicationId")
      .populate("jobId")
      .populate("applicantId");

    if (!session) {
      throw new Error("Interview session not found");
    }

    // Validate session data
    if (
      !session.transcript ||
      !Array.isArray(session.transcript) ||
      session.transcript.length === 0
    ) {
      throw new Error("Interview session has no transcript data");
    }

    if (!session.metadata || !session.metadata.candidateResume) {
      throw new Error("Interview session missing candidate resume data");
    }

    // Prepare transcript for analysis
    const transcript = session.transcript
      .map((turn) => `${turn.speaker}: ${turn.text}`)
      .join("\n\n");

    const analysisPrompt = `
You are an expert HR analyst. Analyze this interview transcript and provide a comprehensive evaluation.

JOB DETAILS:
${JSON.stringify(session.jobId, null, 2)}

CANDIDATE RESUME:
${session.metadata.candidateResume}

INTERVIEW TRANSCRIPT:
${transcript}

Please analyze the interview and provide a JSON response with the following structure:

{
  "overallScore": <number 0-100>,
  "technicalScore": <number 0-100>,
  "behavioralScore": <number 0-100>,
  "communicationScore": <number 0-100>,
  "jobMatchScore": <number 0-100>,
  "strengths": [<array of strength points>],
  "weaknesses": [<array of weakness points>],
  "recommendations": [<array of recommendations>],
  "detailedAnalysis": {
    "technicalSkills": {
      "score": <number 0-100>,
      "feedback": "<detailed feedback>",
      "keyPoints": [<array of key points>]
    },
    "problemSolving": {
      "score": <number 0-100>,
      "feedback": "<detailed feedback>",
      "keyPoints": [<array of key points>]
    },
    "communication": {
      "score": <number 0-100>,
      "feedback": "<detailed feedback>",
      "keyPoints": [<array of key points>]
    },
    "behavioral": {
      "score": <number 0-100>,
      "feedback": "<detailed feedback>",
      "keyPoints": [<array of key points>]
    },
    "experienceMatch": {
      "score": <number 0-100>,
      "feedback": "<detailed feedback>",
      "keyPoints": [<array of key points>]
    }
  },
  "summary": "<comprehensive summary>",
  "recommendation": "<strongly_recommend|recommend|maybe|not_recommend>"
}

Provide only the JSON response, no additional text.
`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    const analysisResult = await model.generateContent(analysisPrompt);

    let analysis;
    try {
      // Clean the response to extract JSON
      if (!analysisResult?.response) {
        throw new Error("No analysis result received");
      }

      const responseText = await analysisResult.response.text();
      if (!responseText) {
        throw new Error("Empty response received from AI model");
      }

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : responseText;

      if (!jsonString) {
        throw new Error("No JSON content found in AI response");
      }

      analysis = JSON.parse(jsonString);

      // Validate analysis structure
      if (!analysis || typeof analysis !== "object") {
        throw new Error("Invalid analysis structure received");
      }

      // Ensure required fields exist with default values
      analysis = {
        overallScore: analysis.overallScore || 50,
        technicalScore: analysis.technicalScore || 50,
        behavioralScore: analysis.behavioralScore || 50,
        communicationScore: analysis.communicationScore || 50,
        jobMatchScore: analysis.jobMatchScore || 50,
        strengths: analysis.strengths || ["Analysis completed"],
        weaknesses: analysis.weaknesses || ["Manual review recommended"],
        recommendations: analysis.recommendations || [
          "Further evaluation needed",
        ],
        detailedAnalysis: analysis.detailedAnalysis || {},
        summary: analysis.summary || "AI analysis completed",
        recommendation: analysis.recommendation || "maybe",
        ...analysis,
      };
    } catch (parseError) {
      console.error("Failed to parse analysis JSON:", parseError);
      // Fallback analysis
      throw parseError;
    }

    // Create report
    const report = new Report({
      applicationId: session.applicationId,
      interviewSessionId: session._id,
      jobId: session.jobId,
      applicantId: session.applicantId,
      analysis,
      summary: analysis.summary || "Analysis completed",
      recommendation: analysis.recommendation || "maybe",
      generatedAt: new Date(),
    });

    await report.save();

    // Update application with report ID
    const application = await Application.findById(session.applicationId);
    if (application) {
      application.reportId = report._id as any;
      await application.save();
    }

    console.log(`Report generated for session ${sessionId}`);
    return report;
  } catch (error) {
    console.error("Error generating interview report:", error);
    throw error;
  }
};
