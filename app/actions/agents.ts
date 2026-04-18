"use server";

import { prisma } from "@/lib/prisma";
import { AgentFormData } from "@/types/agent.type";
import { revalidatePath } from "next/cache";

interface ActionResult {
	success: boolean;
	error?: string;
	agentId?: number;
}

export async function createAgent(
	data: AgentFormData,
	userId: number
): Promise<ActionResult> {
	try {
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { id: true },
		});

		if (!user) {
			return { success: false, error: "用户不存在" };
		}

		const { skillIds, ...rest } = data;

		const agent = await prisma.agent.create({
			data: {
				...rest,
				prompt: "",
				temperature: data.temperature ?? 0.2,
				isPublic: data.isPublic ?? true,
				authorId: userId,
				skills: {
					connect: skillIds.map((id) => ({ id })),
				},
			},
			select: { id: true },
		});

		revalidatePath("/agents");
		revalidatePath("/dashboard");

		return { success: true, agentId: agent.id };
	} catch (error) {
		console.error("创建 agent 失败:", error);
		return { success: false, error: "创建 agent 失败" };
	}
}

export async function updateAgent(
	id: number,
	data: AgentFormData,
	userId: number
): Promise<ActionResult> {
	try {
		const existing = await prisma.agent.findUnique({
			where: { id },
			select: { authorId: true },
		});

		if (!existing || existing.authorId !== userId) {
			return { success: false, error: "无权更新 agent" };
		}

		const { skillIds, ...rest } = data;

		await prisma.agent.update({
			where: { id },
			data: {
				...rest,
				prompt: "",
				temperature: data.temperature ?? 0.2,
				isPublic: data.isPublic ?? true,
				skills: {
					set: skillIds.map((skillId) => ({ id: skillId })),
				},
			},
		});

		revalidatePath("/agents");
		revalidatePath(`/agents/${id}`);
		revalidatePath("/dashboard");

		return { success: true, agentId: id };
	} catch (error) {
		console.error("更新 agent 失败:", error);
		return { success: false, error: "更新 agent 失败" };
	}
}

export async function deleteAgent(
	id: number,
	userId: number
): Promise<ActionResult> {
	try {
		const existing = await prisma.agent.findUnique({
			where: { id },
			select: { authorId: true },
		});

		if (!existing || existing.authorId !== userId) {
			return { success: false, error: "无权删除 agent" };
		}

		await prisma.agent.delete({
			where: { id },
		});

		revalidatePath("/agents");
		revalidatePath("/dashboard");

		return { success: true };
	} catch (error) {
		console.error("删除 agent 失败:", error);
		return { success: false, error: "删除 agent 失败" };
	}
}
