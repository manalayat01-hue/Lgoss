
import { GoogleGenAI, Type } from "@google/genai";
import { Content } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getPersonalizedRecommendations = async (
  history: string[], 
  allContent: Content[]
): Promise<string[]> => {
  try {
    const userHistoryTitles = allContent
      .filter(c => history.includes(c.id))
      .map(c => c.title)
      .join(", ");

    const availableTitles = allContent.map(c => ({ id: c.id, title: c.title, genres: c.genres }));

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `User has watched: [${userHistoryTitles}]. Based on these, recommend the best items from this list of available content: ${JSON.stringify(availableTitles)}. Return only the IDs of the top 3 recommendations.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
            description: "Content ID"
          }
        }
      }
    });

    const recommendedIds: string[] = JSON.parse(response.text || "[]");
    return recommendedIds;
  } catch (error) {
    console.error("AI Recommendation Error:", error);
    return [];
  }
};
