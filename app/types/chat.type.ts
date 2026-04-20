import type { Agent } from "@/types/agent.type";

export type Message = {
    content: string;
    role: "user" | "bot";
};

export type ChatFormData = {
    prompt: string;
};

export type ChatSubmitData = {
    prompt: string;
    agent: Agent;
};
