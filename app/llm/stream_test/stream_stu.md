```ts
// 1. 创建一个简单的 ReadableStream
function createSimpleStream() {
	const data = ["Hello", "World", "!"];
	let index = 0;

	return new ReadableStream({
		start(controller) {
			console.log("Stream 开始");
		},
		pull(controller) {
			if (index < data.length) {
				let s = data[index];
				//转为二进制
				const e = new TextEncoder();
				let a = e.encode(s);
				console.log(`（${s}）对应的二进制为：${a}`);

				// 发送chunk数据块
				controller.enqueue(a);
				index++;
			} else {
				// 发送完成
				controller.close();
				console.log("Stream 结束");
			}
		},
	});
}

// 2. 打印 Stream 内容
async function printStream(stream: ReadableStream) {
	const reader = stream.getReader();
	let result = "";

	console.log("开始读取 Stream...");

	while (true) {
		const { done, value } = await reader.read();
		if (done) {
			console.log("读取完成！");
			break;
		}
		let d = new TextDecoder();
		let s = d.decode(value);
		console.log(`读取到数据:${value}===${s},`);

		result += s;
	}

	console.log("完整内容:", result);
	return result;
}

// function* 模拟流
function* numberStream() {
	yield 1;
	yield 2;
	yield 3;
	yield 4;
	yield 5;
}

// 模拟读取 Stream
function readStreamFromGenerator(gen: Generator) {
	console.log("开始读取...");

	let result = [];
	for (const value of gen) {
		console.log(`读取到: ${value}`);
		result.push(value);
	}

	console.log("读取完成！");
	console.log("完整数据:", result);
	return result;
}

// 异步生成器模拟异步数据流
async function* asyncDataStream() {
	const data = ["Hello", "World", "!"];

	for (const item of data) {
		// await new Promise(resolve => setTimeout(resolve, 500)); // 模拟延迟
		yield item;
		console.log(`已发送: ${item}`);
	}
}

// 读取异步流
async function readAsyncStream(gen: AsyncGenerator) {
	console.log("开始异步读取...");
	let result = "";

	for await (const value of gen) {
		console.log(`接收到: ${value}`);
		result += value;
	}

	console.log("最终结果:", result);
	return result;
}

async function main() {
	//普通流+二进制转换
	// const stream = createSimpleStream();
	// await printStream(stream);
	// function* 模拟流
	// const stream = numberStream()
	// readStreamFromGenerator(stream)
	//异步流
	// const stream = asyncDataStream();
	// await readAsyncStream(stream);
}

main();
```
