import { genAI } from "./AIAgent.js";

export interface StructuredResumeData {
  name: string;
  email: string;
  phone: string;
  experience: Array<{
    company: string;
    position: string;
    duration: string;
    description: string;
    technologies?: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    duration: string;
    gpa?: string;
  }>;
  skills: string[];
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    duration?: string;
    url?: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    date: string;
    expiryDate?: string;
  }>;
  languages?: Array<{
    language: string;
    proficiency: string;
  }>;
  summary?: string;
}

export class StructureResumeAgent {
  /**
   * Parse and structure resume text into structured data using AI
   */
  static async parseResume(
    extractedText: string
  ): Promise<StructuredResumeData> {
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-lite",
      });

      const prompt = this.buildResumeParsingPrompt(extractedText);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const parsedData = response.text();

      // Clean the response to remove markdown formatting if present
      const cleanedData = this.cleanJsonResponse(parsedData);

      // Parse the JSON response
      const structuredData = JSON.parse(cleanedData);

      // Validate and clean the data
      return this.validateAndCleanData(structuredData);
    } catch (error) {
      console.error("Error parsing resume with AI:", error);
      // Return fallback structure if AI parsing fails
      return this.createFallbackStructure(extractedText);
    }
  }

  private static cleanJsonResponse(responseText: string): string {
    // Remove markdown code block formatting if present
    let cleaned = responseText.trim();

    // Remove ```json at the beginning
    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.substring(7);
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.substring(3);
    }

    // Remove ``` at the end
    if (cleaned.endsWith("```")) {
      cleaned = cleaned.substring(0, cleaned.length - 3);
    }

    return cleaned.trim();
  }

  private static buildResumeParsingPrompt(extractedText: string): string {
    return `
You are an expert resume parser. Analyze the following resume text and extract structured information. 
Return ONLY a valid JSON object with the specified structure. Do not include any markdown formatting or additional text.

RESUME TEXT:
${extractedText}

Extract and structure the information into the following JSON format:
{
  "name": "Full name of the candidate",
  "email": "Email address",
  "phone": "Phone number",
  "summary": "Brief professional summary if available",
  "experience": [
    {
      "company": "Company name",
      "position": "Job title/position",
      "duration": "Employment duration (e.g., 'Jan 2020 - Present')",
      "description": "Job description and responsibilities",
      "technologies": ["Tech1", "Tech2"]
    }
  ],
  "education": [
    {
      "institution": "School/University name",
      "degree": "Degree type (e.g., Bachelor's, Master's)",
      "field": "Field of study",
      "duration": "Study duration",
      "gpa": "GPA if mentioned"
    }
  ],
  "skills": ["Skill1", "Skill2", "Skill3"],
  "projects": [
    {
      "name": "Project name",
      "description": "Project description",
      "technologies": ["Tech1", "Tech2"],
      "duration": "Project duration if available",
      "url": "Project URL if available"
    }
  ],
  "certifications": [
    {
      "name": "Certification name",
      "issuer": "Issuing organization",
      "date": "Issue date",
      "expiryDate": "Expiry date if applicable"
    }
  ],
  "languages": [
    {
      "language": "Language name",
      "proficiency": "Proficiency level"
    }
  ]
}

IMPORTANT RULES:
1. Return ONLY valid JSON, no markdown or additional formatting
2. If a field is not found, use an empty string for strings or empty array for arrays
3. Be as accurate as possible in extracting the information
4. For dates, use the format found in the resume
5. Extract all technical skills mentioned
6. Include all work experience and education entries
7. If contact information is unclear, make best effort to extract what's available
`;
  }

  private static validateAndCleanData(data: any): StructuredResumeData {
    // Ensure all required fields exist with proper defaults
    return {
      name: data.name || "Not specified",
      email: data.email || "Not specified",
      phone: data.phone || "Not specified",
      summary: data.summary || "",
      experience: Array.isArray(data.experience) ? data.experience : [],
      education: Array.isArray(data.education) ? data.education : [],
      skills: Array.isArray(data.skills)
        ? data.skills.filter((skill: any) => typeof skill === "string")
        : [],
      projects: Array.isArray(data.projects) ? data.projects : [],
      certifications: Array.isArray(data.certifications)
        ? data.certifications
        : [],
      languages: Array.isArray(data.languages) ? data.languages : [],
    };
  }

  private static createFallbackStructure(
    extractedText: string
  ): StructuredResumeData {
    // Basic extraction using regex patterns as fallback
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/;
    const phoneRegex = /(\+?[\d\s\-\(\)]{10,})/;

    const emailMatch = extractedText.match(emailRegex);
    const phoneMatch = extractedText.match(phoneRegex);

    // Simple name extraction (first line that looks like a name)
    const lines = extractedText
      .split("\n")
      .filter((line) => line.trim().length > 0);
    const nameCandidate =
      lines.find(
        (line) =>
          line.length > 2 &&
          line.length < 50 &&
          !line.includes("@") &&
          !line.match(/^\d/) &&
          !line.toLowerCase().includes("resume") &&
          !line.toLowerCase().includes("cv")
      ) || "Name not found";

    return {
      name: nameCandidate,
      email: emailMatch ? emailMatch[1] : "Email not found",
      phone: phoneMatch ? phoneMatch[1].trim() : "Phone not found",
      summary: "",
      experience: [],
      education: [],
      skills: [],
      projects: [],
      certifications: [],
      languages: [],
    };
  }
}
