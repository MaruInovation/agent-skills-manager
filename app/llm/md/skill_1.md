```ts
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';
export interface Skill {
    name: string;
    description: string;
    inputSchema: string;
    execute: (args: any) => Promise<string | object>;
}

const ** filename = fileURLToPath(import.meta.url);
const ** dirname = path.dirname(\_\_filename);

const parkInfo = fs.readFileSync(
    path.join(\_\_dirname, "weather.md"),
    "utf-8"
);

// 通用指令（同时支持多个 skill）
export const generalInstructions = `你是专业的旅游助手，可以查询实时天气和城市知名建筑信息。

重要规则：

1. 当用户询问天气时，必须调用 get_weather 工具
2. 当用户询问建筑、地标、景点时，必须调用 get_landmark 工具
3. 如果用户同时询问天气和建筑，可以依次调用两个工具
4. 获取数据后，用自然语言、友好的方式回复用户
5. 如果用户没有指定城市，请先询问城市名称
   `;

// 天气 Skill
export const weatherSkill = {
    name: "get_weather",
    description: "查询指定城市的实时天气预报",
    inputSchema: JSON.stringify({
        type: "object",
        properties: {
            city: {
                type: "string",
                description: "需要查询天气的城市名称",
            },
        },
        required: [ "city" ],
    }),

    async execute(args: { city: string }) {
        console.log('调用天气接口');

        await new Promise((resolve) => setTimeout(resolve, 300));

        const weatherMap: Record<string, string> = {
            北京: "☀️ 晴天 24℃，微风，空气优良",
            上海: "⛅ 多云 27℃，东南风3级",
            广州: "🌧️ 小雨 25℃，湿度85%",
            深圳: "⛈️ 雷阵雨 26℃，请注意防雷",
            杭州: "🌤️ 多云转晴 22℃，西风2级",
            成都: "☁️ 阴天 20℃，微风",
            西安: "☀️ 晴天 26℃，东风2级",
        };

        let a = weatherMap[ args.city ] || `暂无【${args.city}】的天气数据`;
        return { message: a }
    },

};

// 建筑 Skill
export const landmarkSkill = {
    name: "get_landmark",
    description: "查询指定城市的知名建筑、地标或景点信息",
    inputSchema: JSON.stringify({
        type: "object",
        properties: {
            city: {
                type: "string",
                description: "需要查询建筑信息的城市名称",
            },
        },
        required: [ "city" ],
    }),

    async execute(args: { city: string }) {
        console.log('调用建筑接口');
        await new Promise((resolve) => setTimeout(resolve, 300));

        const landmarkMap: Record<string, { name: string; description: string }> = {
            北京: {
                name: "故宫博物院",
                description: "世界上现存规模最大、保存最为完整的木质结构古建筑群，明清两代的皇家宫殿"
            },
            上海: {
                name: "东方明珠塔",
                description: "浦东新区标志性建筑，塔高468米，可俯瞰上海全景"
            },
            广州: {
                name: "广州塔（小蛮腰）",
                description: "中国第一高塔，塔身设计独特，夜晚灯光秀非常壮观"
            },
            深圳: {
                name: "平安金融中心",
                description: "深圳第一高楼，118层观景台可俯瞰整个城市"
            },
            杭州: {
                name: "西湖",
                description: "世界文化遗产，'上有天堂，下有苏杭'的美誉，十景闻名天下"
            },
            成都: {
                name: "宽窄巷子",
                description: "清代古街道，由宽窄巷子组成，体验成都慢生活的绝佳去处"
            },
            西安: {
                name: "兵马俑",
                description: "世界第八大奇迹，秦始皇陵的守护者"
            },
        };

        const landmark = landmarkMap[ args.city ];
        let a = landmark
            ? `${landmark.name}：${landmark.description}`
            : `暂无【${args.city}】的建筑信息`;


        return { message: a }
    },

};

// 导出 tools 配置
export const tools = [
    {
        type: "function" as const,
        function: {
            name: weatherSkill.name,
            description: `${weatherSkill.description}`,
            parameters: JSON.parse(weatherSkill.inputSchema),
        },
    },
    {
        type: "function" as const,
        function: {
            name: landmarkSkill.name,
            description: landmarkSkill.description,
            parameters: JSON.parse(landmarkSkill.inputSchema),
        },
    },
];

// 获取 skill 的映射
export const skillMap: Record<string, Skill> = {
    [ weatherSkill.name ]: weatherSkill,
    [ landmarkSkill.name ]: landmarkSkill,
};

```
