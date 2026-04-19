```ts
export const tools = [
	{
		type: "function" as const,
		function: {
			name: "get_weather",
			description: `
第三方接口文档：
接口地址：http://192.168.1.36:3000/api/test/weather
请求方式：POST
参数：{ city: 城市名 }
返回：{ message: 天气情况 }
`,
			parameters: {
				type: "object",
				properties: {
					url: { type: "string" },
					method: { type: "string", enum: ["POST"] },
					post_data: { type: "object" },
				},
				required: ["url", "method"],
			},
		},
	},

	{
		type: "function" as const,
		function: {
			name: "get_landmark",
			description: `
第三方接口文档：
接口地址：http://192.168.1.36:3000/api/test/landmark
请求方式：POST
参数：{ city: 城市名 }
返回：{ message: 景点情况 }
`,
			parameters: {
				type: "object",
				properties: {
					url: { type: "string" },
					method: { type: "string", enum: ["POST"] },
					post_data: { type: "object" },
				},
				required: ["url", "method"],
			},
		},
	},
];
```
