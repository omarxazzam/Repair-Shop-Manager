
import { GoogleGenAI } from "@google/genai";

// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeRepairIssue = async (device: string, issue: string): Promise<string> => {
  try {
    // When using generate content for text answers, use ai.models.generateContent directly
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
      أنت خبير صيانة هواتف ذكية.
      الجهاز: ${device}
      المشكلة: ${issue}
      
      قم بتقديم تحليل مختصر جداً (باللغة العربية) يتضمن:
      1. السبب المحتمل للعطل.
      2. القطع التي قد تحتاج لاستبدال.
      3. مستوى صعوبة الإصلاح (سهل/متوسط/صعب).
      
      اجعل الرد كنقاط واضحة.
    `,
    });

    // Use the .text property (not a method) to extract the text output
    return response.text || "لم يتم استلام رد من النظام.";
  } catch (error) {
    console.error("AI Error:", error);
    return "حدث خطأ أثناء الاتصال بالمساعد الذكي.";
  }
};
