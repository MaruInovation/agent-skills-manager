export interface SkillFormData {
    // 名称
    name: string;
    // 描述
    description: string;
    // 参数
    inputSchema: string;
    // 返回值
    outputSchema: string;
    // skill内容
    content: string;
    // 是否公共
    isPublic: boolean;
    // 标签
    tags: string;
    //异常
    errorHandling: string;
    // 示例
    examples: string
}