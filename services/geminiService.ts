

import { GoogleGenAI } from "@google/genai";
// Fix: Corrected import path to be relative.
import { Shift, Employee } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateDailyBriefing = async (shifts: Shift[], employees: Employee[]): Promise<string> => {
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
