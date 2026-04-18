import { AgentFormData } from "@/types/agent.type";

type AgentTextField = Exclude<keyof AgentFormData, "isPublic" | "skillIds">;

export const agentFormFields: Array<{
	name: AgentTextField;
	label: string;
	type: "input" | "textarea";
	inputType?: "text" | "number";
	placeholder: string;
	maxLength?: number;
	rows?: number;
	required: boolean;
}> = [
		{
			name: "name",
			label: "Agent 名称",
			type: "input",
			inputType: "text",
			placeholder: "例如：support-agent",
			maxLength: 100,
			required: true,
		},
		{
			name: "description",
			label: "描述",
			type: "input",
			inputType: "text",
			placeholder: "简要介绍这个 agent 的用途",
			maxLength: 500,
			required: false,
		},
		{
			name: "model",
			label: "模型",
			type: "input",
			inputType: "text",
			placeholder: "例如：deepseek-chat",
			maxLength: 100,
			required: true,
		},
		{
			name: "temperature",
			label: "温度（0.1 ~ 2）",
			type: "input",
			inputType: "number",
			placeholder: "0.2",
			required: true,
		},
		{
			name: "systemContent",
			label: "System 会话 (Markdown)",
			type: "textarea",
			placeholder: "系统会话",
			rows: 12,
			required: true,
		},
	];
