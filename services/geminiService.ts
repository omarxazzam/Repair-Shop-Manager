import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const analyzeRepairIssue = async (device: string, issue: string): Promise<string> => {
  if (!ai) return "الرجاء تكوين مفتاح API لاستخدام الذكاء الاصطناعي.";

  try {
    const model = ai.models.getGenerativeModel({ model: "gemini-3-flash-preview" });
    const prompt = `
      أنت خبير صيانة هواتف ذكية.
      الجهاز: ${device}
      المشكلة: ${issue}
      
      قم بتقديم تحليل مختصر جداً (باللغة العربية) يتضمن:
      1. السبب المحتمل للعطل.
      2. القطع التي قد تحتاج لاستبدال.
      3. مستوى صعوبة الإصلاح (سهل/متوسط/صعب).
      
      اجعل الرد كنقاط واضحة.
    `;

    const result = await model.generateContent({
        contents: prompt
    });
    return result.text || "لم يتم استلام رد من النظام.";
  } catch (error) {
    console.error("AI Error:", error);
    return "حدث خطأ أثناء الاتصال بالمساعد الذكي.";
  }
};
