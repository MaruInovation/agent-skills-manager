import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        console.log("调用天气接口");
        const body = await request.json();
        const { city } = body;

        if (!city) {
            return NextResponse.json({ error: "城市必填" }, { status: 400 });
        }

        const weatherMap: Record<string, string> = {
            北京: "☀️ 晴天 24℃，微风，空气优良",
            上海: "⛅ 多云 27℃，东南风3级",
            广州: "🌧️ 小雨 25℃，湿度85%",
            深圳: "⛈️ 雷阵雨 26℃，请注意防雷",
            杭州: "🌤️ 多云转晴 22℃，西风2级",
            成都: "☁️ 阴天 20℃，微风",
            西安: "☀️ 晴天 26℃，东风2级",
        };


        return NextResponse.json({ message: weatherMap[ city ] || `暂无【${city}】的天气数据` });
    } catch (error) {
        console.error("获取天气异常:", error);
        return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
    }
}
