import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        console.log("调用景点接口");
        const body = await request.json();
        const { city } = body;

        if (!city) {
            return NextResponse.json({ error: "城市必填" }, { status: 400 });
        }

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

        const landmark = landmarkMap[ city ];

        let msg = landmark
            ? `${landmark.name}：${landmark.description}`
            : `暂无【${city}】的建筑信息`;

        return NextResponse.json({ message: msg });
    } catch (error) {
        console.error("获取景点异常:", error);
        return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
    }
}
