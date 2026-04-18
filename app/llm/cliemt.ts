import OpenAI from "openai";

type GenerateTextOptions = {
    model?: string;
    messages: any[];
    temperature?: number;
    max_tokens?: number;
};

type GenerateTextResult = {
    id: string;
    text: string;
};

const client = new OpenAI({
    baseURL: "https://api.deepseek.com/v1",
    apiKey: process.env.DEEPSEEK_API_KEY,
});

const generateText = async ({
    model = "deepseek-chat",
    messages,
    temperature = 0.2,
    max_tokens = 200,
}: GenerateTextOptions): Promise<GenerateTextResult> => {
    const completion = await client.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens,
    });

    return {
        id: completion.id,
        text: completion.choices[0]?.message.content || "无法回答",
    };
};

export const llmClient = {
    generateText,
};
