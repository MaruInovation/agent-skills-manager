import OpenAI from "openai";

type GenerateTextOptions = {
    model?: string;
    messages: any[];
    temperature?: number;
    max_tokens?: number;
    stream?: boolean;
};

type GenerateTextResult = {
    id: string;
    text: string;
};

const client = new OpenAI({
    baseURL: "https://api.deepseek.com/v1",
    apiKey: process.env.DEEPSEEK_API_KEY,
});



// 流式输出方法
const generateTextStream = async ({
    model = "deepseek-chat",
    messages,
    temperature = 0.2,
    max_tokens = 200,
}: GenerateTextOptions) => {
    const stream = await client.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens,
        stream: true,
    });

    return stream;
};


export const llmClient = {
    generateTextStream
};
