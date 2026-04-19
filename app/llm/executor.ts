import OpenAI from "openai";
import { fetchApi } from "./fetchApi";
import { Agent } from "@/types/agent.type";

export interface ToolCall {
    id: string;
    function: {
        name: string;
        arguments: string;
    };
}

export interface Tools {
    type: "function";
    function: {
        name: string;
        description: string;
        parameters: {
            type: string;
            properties: {
                url: {
                    type: string;
                };
                method: {
                    type: string;
                    enum: string[];
                };
                post_data: {
                    type: string;
                };
            };
            required: string[];
        };
    };
}

export const getTools = (agent?: Agent): Tools[] => {
    let tools: Tools[] = [];
    if (!agent || !agent.skills || !agent.skills.length) return [];

    agent.skills.forEach((s) => {
        tools.push({
            type: "function",
            function: {
                name: s.name,
                description: s.content,
                parameters: {
                    type: "object",
                    properties: {
                        url: { type: "string" },
                        method: {
                            type: "string",
                            enum: [ "GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS" ],
                        },
                        post_data: { type: "object" },
                    },
                    required: [ "url", "method" ],
                },
            },
        });
    });

    return tools;
};

/**
 * 执行工具调用
 * @param toolCall 工具调用对象
 * @returns 工具执行结果
 */

export async function executeToolCall(
    toolCall: OpenAI.Chat.Completions.ChatCompletionMessageToolCall
): Promise<string> {
    //ChatCompletionMessageToolCall里面没function，打印出来有。只能用类型守卫了
    if (!toolCall || toolCall.type !== "function") return "";

    const { name, arguments: args } = toolCall.function;

    if (!args) {
        console.error(`未知工具: ${name}`);
        return `错误：未找到工具 "${name}"`;
    }

    let args_obj = JSON.parse(args);
    if (!fetchApi.validateApiArgs(args_obj)) return `错误：arguments格式错误"`;

    try {
        // console.log(`执行工具: ${name}`, parsedArgs);

        const result = await fetchApi.request_third_party_api(args_obj);

        // 如果结果是对象，转换为字符串
        if (typeof result === "object") {
            return JSON.stringify(result);
        }

        return result;
    } catch (error) {
        console.error(`工具执行错误 [${name}]:`, error);
        return `执行 ${name} 时出错：${error instanceof Error ? error.message : String(error)}`;
    }
}

/**
 * 批量执行工具调用
 * @param toolCalls 工具调用数组
 * @returns 工具执行结果数组
 */
export async function executeMultipleToolCalls(
    toolCalls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[]
): Promise<Array<{ tool_call_id: string; role: "tool"; content: string }>> {
    const results = [];

    for (const toolCall of toolCalls) {
        const result = await executeToolCall(toolCall);
        results.push({
            tool_call_id: toolCall.id,
            role: "tool" as const,
            content: result,
        });
    }

    return results;
}
