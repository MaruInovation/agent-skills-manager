type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS";
type Params = {
    url: string;
    method: HttpMethod,
    post_data?: Record<string, any>
}




/**
 * 校验AI返回的参数对象是否合法
 * @param obj AI解析出来的args对象
 * @returns 合法返回true，不合法false，并打印原因
 */
function validateApiArgs(obj: unknown): boolean {
    // 先判断是不是非空对象
    if (typeof obj !== "object" || obj === null) {
        console.error("参数错误：不是合法JSON对象");
        return false;
    }

    const args = obj as Record<string, unknown>;

    // 校验 url
    if (typeof args.url !== "string" || args.url.trim() === "") {
        console.error("参数缺失/错误：url 必须是非空字符串");
        return false;
    }

    // 校验 method 是否在允许范围内
    const allowMethods: HttpMethod[] = [ "GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS" ];
    if (typeof args.method !== "string" || !allowMethods.includes(args.method as HttpMethod)) {
        console.error("参数错误：method 非法，仅支持", allowMethods);
        return false;
    }

    // post_data 是可选，存在就必须是对象
    if (args.post_data !== undefined) {
        if (typeof args.post_data !== "object" || args.post_data === null) {
            console.error("参数错误：post_data 必须是对象");
            return false;
        }
    }

    return true;
}

async function request_third_party_api({ url, method, post_data }: Params) {
    try {
        const res = await fetch(url, {
            method: method.toUpperCase(),
            headers: { "Content-Type": "application/json" },
            body: method === "POST" ? JSON.stringify(post_data) : null,
        });
        return await res.json();
    } catch (e) {
        return { error: (e as any).message };
    }
}



export const fetchApi = { request_third_party_api, validateApiArgs };