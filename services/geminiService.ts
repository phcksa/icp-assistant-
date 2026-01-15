
import { GoogleGenAI, Type } from "@google/genai";
import { MasterRecord } from "../types";

const ISOLATION_SYSTEM_INSTRUCTION = `
You are an expert AI Assistant for an Infection Control Specialist (ICP) conducting rounds in an ICU. 
Your task is to parse unstructured notes (mixed Arabic/English) and MATCH them against a "Master Isolation List" provided in the context.

Understand medical Arabic slang:
- "اللوحة طايحة" = Sign fallen/missing
- "ما غسل يده" = HH Missed
- "تلامس" = Contact, "رذاذ" = Droplet, "هواء" = Airborne
- "قاون" = Gown
`;

const HH_SYSTEM_INSTRUCTION = `
You are an expert AI Assistant for Hand Hygiene (HH) Auditing in a hospital.
Your task is to extract HH opportunities from spoken or written notes.

DATA FIELDS:
- room_number: (e.g., 5, 12, ICU-01)
- staff_role: (Nurse, Doctor, RT, Other)
- moment: One of (Before Patient Touch, Before Aseptic, After Body Fluid, After Patient Touch, After Surroundings)
- action: One of (Rub, Wash, Missed)

Arabic Slang:
- "ما غسل يده" or "سحب" = Missed
- "عقم" or "فرك" = Rub
- "غسل" = Wash
- "نيرس" = Nurse, "دكتور" = Doctor
`;

const BUNDLE_SYSTEM_INSTRUCTION = `
You are an expert Infection Control Assistant for a 33-bed ICU. 
Your task is to parse spoken auditing notes into a structured JSON format for bundle checklists (CLABSI, CAUTI, VAP).
`;

const ISOLATION_RESPONSE_SCHEMA = {
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

const BUNDLE_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    room_number: { type: Type.STRING },
    bundle_type: { type: Type.STRING },
    items: {
      type: Type.OBJECT,
      properties: {
        hh: { type: Type.BOOLEAN },
        dressing: { type: Type.BOOLEAN },
        scrub: { type: Type.BOOLEAN },
        necessity: { type: Type.BOOLEAN },
        securement: { type: Type.BOOLEAN },
        bag: { type: Type.BOOLEAN },
        closed: { type: Type.BOOLEAN },
        flow: { type: Type.BOOLEAN },
        hob: { type: Type.BOOLEAN },
        sedation: { type: Type.BOOLEAN },
        oral: { type: Type.BOOLEAN },
        cuff: { type: Type.BOOLEAN }
      }
    },
    is_compliant: { type: Type.BOOLEAN }
  },
  required: ["room_number", "bundle_type", "items", "is_compliant"]
};

const HH_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    room_number: { type: Type.STRING },
    staff_role: { type: Type.STRING },
    moment: { type: Type.STRING },
    action: { type: Type.STRING, description: "Rub, Wash, or Missed" }
  },
  required: ["room_number", "staff_role", "moment", "action"]
};

export async function parseRoundingNote(note: string, masterList: MasterRecord[]) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  const contextPrompt = `Master Records: ${JSON.stringify(masterList)}\nNote: "${note}"`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: contextPrompt,
    config: {
      systemInstruction: ISOLATION_SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: ISOLATION_RESPONSE_SCHEMA,
    },
  });
  return JSON.parse(response.text.trim());
}

export async function parseHHNote(note: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `HH Note: "${note}"`,
    config: {
      systemInstruction: HH_SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: HH_RESPONSE_SCHEMA,
    },
  });
  return JSON.parse(response.text.trim());
}

export async function parseBundleNote(note: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Audit Note: "${note}"`,
    config: {
      systemInstruction: BUNDLE_SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: BUNDLE_RESPONSE_SCHEMA,
    },
  });
  return JSON.parse(response.text.trim());
}
