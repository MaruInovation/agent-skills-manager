```ts
type StreamDelta = {
	content?: string;
	tool_calls?: Array<{
		index: number;
		id?: string;
		type?: "function";
		function?: {
			name?: string;
			arguments?: string;
		};
	}>;
};

type StreamChunk = {
	choices: Array<{
		index: number;
		delta: StreamDelta;
		finish_reason?: string | null;
	}>;
};

// 模拟多工具混合调用的 stream（天气 + 建筑）
export async function* mockStreamWithMixedContent(): AsyncGenerator<StreamChunk> {
	// Chunk 1: AI 开始说话
	yield {
		choices: [
			{
				index: 0,
				delta: {
					content: "好的",
				},
			},
		],
	};

	// Chunk 2: 继续说话
	yield {
		choices: [
			{
				index: 0,
				delta: {
					content: "，我来帮你查询北京的信息。",
				},
			},
		],
	};

	// Chunk 3: 开始第一个工具调用（天气）
	yield {
		choices: [
			{
				index: 0,
				delta: {
					tool_calls: [
						{
							index: 0,
							id: "call_weather_001",
							type: "function",
							function: {
								name: "get_weather",
								arguments: "",
							},
						},
					],
				},
			},
		],
	};

	// Chunk 4: 第一个工具的参数 - 片段1
	yield {
		choices: [
			{
				index: 0,
				delta: {
					tool_calls: [
						{
							index: 0,
							function: {
								arguments: '{"city": "',
							},
						},
					],
				},
			},
		],
	};

	// Chunk 5: 第一个工具的参数 - 片段2
	yield {
		choices: [
			{
				index: 0,
				delta: {
					tool_calls: [
						{
							index: 0,
							function: {
								arguments: "北京",
							},
						},
					],
				},
			},
		],
	};

	// Chunk 6: 第一个工具的参数 - 片段3（完成）
	yield {
		choices: [
			{
				index: 0,
				delta: {
					tool_calls: [
						{
							index: 0,
							function: {
								arguments: '"}',
							},
						},
					],
				},
			},
		],
	};

	// Chunk 7: 开始第二个工具调用（建筑）
	yield {
		choices: [
			{
				index: 0,
				delta: {
					tool_calls: [
						{
							index: 1,
							id: "call_landmark_002",
							type: "function",
							function: {
								name: "get_landmark",
								arguments: "",
							},
						},
					],
				},
			},
		],
	};

	// Chunk 8: 第二个工具的参数 - 片段1
	yield {
		choices: [
			{
				index: 0,
				delta: {
					tool_calls: [
						{
							index: 1,
							function: {
								arguments: '{"city": "',
							},
						},
					],
				},
			},
		],
	};

	// Chunk 9: 第二个工具的参数 - 片段2
	yield {
		choices: [
			{
				index: 0,
				delta: {
					tool_calls: [
						{
							index: 1,
							function: {
								arguments: "北京",
							},
						},
					],
				},
			},
		],
	};

	// Chunk 10: 第二个工具的参数 - 片段3（完成）
	yield {
		choices: [
			{
				index: 0,
				delta: {
					tool_calls: [
						{
							index: 1,
							function: {
								arguments: '"}',
							},
						},
					],
				},
			},
		],
	};

	// Chunk 11: 工具调用结束标记
	yield {
		choices: [
			{
				index: 0,
				finish_reason: "tool_calls",
				delta: {},
			},
		],
	};

	// Chunk 12: 工具调用完成后，AI 继续说话
	yield {
		choices: [
			{
				index: 0,
				delta: {
					content: "\n\n根据查询结果，",
				},
			},
		],
	};

	// Chunk 13: 继续输出
	yield {
		choices: [
			{
				index: 0,
				delta: {
					content: "北京今天晴天，24℃。",
				},
			},
		],
	};

	// Chunk 14: 继续输出
	yield {
		choices: [
			{
				index: 0,
				delta: {
					content: "著名建筑故宫博物院很值得参观！",
				},
			},
		],
	};

	// Chunk 15: 最终结束
	yield {
		choices: [
			{
				index: 0,
				finish_reason: "stop",
				delta: {},
			},
		],
	};
}

//流式处理，实时返回tools
//用于llm，同时分离出tools
const generateTextStreamWithTools = async () => {
	const stream = await mockStreamWithMixedContent();

	// 用于累积 tool_calls
	const toolCallsMap: Map<
		number,
		{
			id: string;
			function: { name: string; arguments: string };
		}
	> = new Map();

	let hasToolCalls = false;

	// 创建可读流，边接收边处理
	const readableStream = new ReadableStream({
		// 初始化，可以立即入队数据
		async start(controller) {
			try {
				for await (const chunk of stream) {
					const delta = chunk.choices[0]?.delta;

					// 处理普通内容
					if (delta?.content) {
						controller.enqueue(new TextEncoder().encode(delta.content));
					}

					// 处理 tool_calls
					console.log(!!delta?.tool_calls);

					if (delta?.tool_calls) {
						hasToolCalls = true;
						for (const toolCallDelta of delta.tool_calls) {
							const index = toolCallDelta.index;

							if (!toolCallsMap.has(index)) {
								toolCallsMap.set(index, {
									id: toolCallDelta.id || "",
									function: {
										name: toolCallDelta.function?.name || "",
										arguments: toolCallDelta.function?.arguments || "",
									},
								});
							} else {
								const existing = toolCallsMap.get(index)!;
								if (toolCallDelta.function?.arguments) {
									existing.function.arguments += toolCallDelta.function.arguments;
								}
							}
						}
					}
				}

				// 如果有工具调用，将工具调用信息附加到流中
				if (hasToolCalls) {
					const toolCalls = Array.from(toolCallsMap.values());
					// 发送特殊标记，表示需要执行工具
					const toolCallSignal = JSON.stringify({
						type: "TOOL_CALLS",
						data: toolCalls,
					});
					controller.enqueue(new TextEncoder().encode(`\n${toolCallSignal}\n`));
				}

				controller.close();
			} catch (error) {
				controller.error(error);
			}
		},
	});

	return {
		stream: readableStream,
	};
};

async function readAsyncStream(gen: ReadableStream) {
	let result = "";

	for await (const value of gen) {
		let d = new TextDecoder();

		result += d.decode(value);
	}

	return result;
}

async function main() {
	const { stream } = await generateTextStreamWithTools();
	// console.log('hasToolCalls=', hasToolCalls());
	// console.log('getToolCalls=', getToolCalls());

	let s = await readAsyncStream(stream);

	console.log(s);
}

main();
```
