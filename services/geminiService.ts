
import { GoogleGenAI, Type } from "@google/genai";
import { MasterRecord } from "../types";

const SYSTEM_INSTRUCTION = `
You are an expert AI Assistant for an Infection Control Specialist (ICP) conducting rounds in an ICU. 
Your task is to parse unstructured notes (mixed Arabic/English) and MATCH them against a "Master Isolation List" provided in the context.

Understand medical Arabic slang:
- "اللوحة طايحة" = Sign fallen/missing
- "ما غسل يده" = HH Missed
- "تلامس" = Contact, "رذاذ" = Droplet, "هواء" = Airborne
- "قاون" = Gown

MATCHING LOGIC:
1. You will be provided with a JSON array of "MasterRecords" (The official Excel data).
2. When the user mentions a room, look it up in the MasterRecords.
3. Compare the "observed" organism/isolation type from the user's note with the "expected" data from the MasterRecords.
4. If they differ, set status: "Mismatched" and include the 'expected_organism' in the response.
5. If the room isn't in the records, evaluate based only on the note.
`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    room_number: { type: Type.STRING, nullable: true },
    isolation_verification: {
      type: Type.OBJECT,
      properties: {
        status: { type: Type.STRING, description: "Matched / Mismatched / Not Mentioned" },
        observed_type: { type: Type.STRING },
        organism: { type: Type.STRING },
        expected_organism: { type: Type.STRING, nullable: true },
        sign_present: { type: Type.BOOLEAN, nullable: true }
      },
      required: ["status", "observed_type", "organism"]
    },
    issues: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    hand_hygiene: {
      type: Type.OBJECT,
      properties: {
        opportunity_detected: { type: Type.BOOLEAN },
        moment: { type: Type.STRING, nullable: true },
        action: { type: Type.STRING, nullable: true },
        staff_role: { type: Type.STRING, nullable: true }
      },
      required: ["opportunity_detected"]
    },
    action_taken: { type: Type.BOOLEAN }
  },
  required: ["room_number", "isolation_verification", "issues", "hand_hygiene", "action_taken"]
};

export async function parseRoundingNote(note: string, masterList: MasterRecord[]) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
  const contextPrompt = `
Master Records (Official Excel Data):
${JSON.stringify(masterList)}

User Rounding Note:
"${note}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: contextPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
    });

    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("Error parsing rounding note:", error);
    throw error;
  }
}
