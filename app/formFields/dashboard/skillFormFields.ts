import { SkillFormData } from "@/types/skill.type";

export const formFields: Array<{
    name: keyof SkillFormData;
    label: string;
    type: "input" | "textarea";
    placeholder: string;
    maxLength?: number;
    rows?: number;
    required: boolean;
}> = [
        {
            name: "name",
            label: "Skill 名称",
            type: "input",
            placeholder: "例如：my-skill",
            maxLength: 100,
            required: true,
        },
        {
            name: "description",
            label: "描述",
            type: "input",
            placeholder: "简要说明此 skill 的作用",
            maxLength: 500,
            required: true,
        },
        {
            name: "tags",
            label: "标签",
            type: "input",
            placeholder: "用于agent调用匹配",
            maxLength: 500,
            required: true,
        },
        {
            name: "inputSchema",
            label: "Skill 参数 (JSON)",
            type: "textarea",
            placeholder: '{"参数名":"参数描述"}',
            rows: 10,
            required: true,
        },
        {
            name: "outputSchema",
            label: "Skill 返回值 (JSON)",
            type: "textarea",
            placeholder: '{"字段名":"返回值描述"}',
            rows: 10,
            required: true,
        },
        {
            name: "content",
            label: "Skill 内容 (Markdown)",
            type: "textarea",
            placeholder: "skill执行步骤",
            rows: 16,
            required: true,
        },
        {
            name: "errorHandling",
            label: "异常 (Markdown)",
            type: "textarea",
            placeholder: "调用skill异常处理",
            rows: 10,
            required: true,
        },
        {
            name: "examples",
            label: "示例 (Markdown)",
            type: "textarea",
            placeholder: "整个skill的示例",
            rows: 16,
            required: true,
        },
    ];