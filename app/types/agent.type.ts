export interface AgentFormData {
	/** Agent 名称 */
	name: string;
	/** 描述 */
	description?: string;
	/** 系统指令 */
	systemContent: string;
	/** 模型名称 */
	model: string;
	/** 温度系数，默认0.7 */
	temperature?: number;
	/** 是否公开 */
	isPublic?: boolean;
	/** 绑定的技能 ID 数组 */
	skillIds: number[];
}
