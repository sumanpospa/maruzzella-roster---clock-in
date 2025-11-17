import { GoogleGenAI } from "@google/genai";
import { Shift, Employee } from '../types';

// Support Vite define() injection and optional key
const API_KEY = (process.env as any)?.API_KEY || (process.env as any)?.GEMINI_API_KEY;
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

export const generateDailyBriefing = async (shifts: Shift[], employees: Employee[]): Promise<string> => {
  if (!ai) {
    return "AI briefing is disabled (no API key). You can enable it by setting GEMINI_API_KEY in your environment.";
  }
  if (shifts.length === 0) {
    return "No staff are scheduled to work today. The restaurant might be closed.";
  }

  const employeeMap = new Map(employees.map(e => [e.id, e]));

  const shiftDetails = shifts
    .map(shift => {
        const shiftEmployees = shift.employeeIds
            .map(id => employeeMap.get(id))
            .filter((e): e is Employee => !!e);

        if (shiftEmployees.length === 0) return null;

        const employeeNames = shiftEmployees.map(e => e.name).join(', ');

        if (shift.startTime && shift.endTime) {
            const notes = shift.notes ? ` (${shift.notes})` : '';
            return `- ${employeeNames} from ${shift.startTime} to ${shift.endTime}${notes}.`;
        }
        if (shift.notes) {
            return `- ${employeeNames} is on: ${shift.notes}.`;
        }
        return null;
    })
    .filter(Boolean)
    .join('\n');

  if (!shiftDetails) {
     return "No staff with timed shifts are scheduled for today.";
  }

  const prompt = `
    You are the manager of an Italian restaurant called Maruzzella.
    Generate a short, friendly, and motivational daily briefing for the team based on today's roster.
    Keep it concise and positive. Mention the staff working today and any special statuses like days off.

    Today's Roster:
    ${shiftDetails}

    Briefing:
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating daily briefing:", error);
    return "Sorry, I couldn't generate a briefing right now. Let's have a great day!";
  }
};
