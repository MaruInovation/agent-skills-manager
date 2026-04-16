"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// skill表单数据类型定义
interface SkillFormData {
    name: string;        // skill名称
    description: string; // skill简短描述
    content: string;     // skill详情内容
    isPublic: boolean;   // 是否公开
}

// 服务端动作返回结果类型
interface ActionResult {
    success: boolean;    // 是否成功
    error?: string;      // 失败时的错误信息（可选）
    skillId?: number;    // 成功时返回skill ID（可选）
}

/**
 * 创建skill
 * @param data skill表单数据
 * @param userId 当前登录用户ID
 * @returns 创建结果
 */
export async function createSkill(
    data: SkillFormData,
    userId: number
): Promise<ActionResult> {
    try {

        // 向数据库插入一条新skill
        const skill = await prisma.skill.create({
            data: {
                name: data.name,
                description: data.description,
                content: data.content,
                isPublic: data.isPublic,
                authorId: userId, // 绑定创建者ID
            },
        });

        // 刷新页面缓存，让前端显示最新数据
        revalidatePath("/skills");
        revalidatePath("/dashboard");

        // 返回成功结果
        return { success: true, skillId: skill.id };
    } catch (error) {
        // 错误日志 + 友好提示
        console.error("创建 skill 错误:", error);
        return { success: false, error: "skill 创建失败" };
    }
}

/**
 * 更新skill
 * @param id skillID
 * @param data 新的表单数据
 * @param userId 当前登录用户ID
 * @returns 更新结果
 */
export async function updateSkill(
    id: number,
    data: SkillFormData,
    userId: number
): Promise<ActionResult> {
    try {
        // 1. 先查询skill，校验是否属于当前用户（权限校验）
        const existing = await prisma.skill.findUnique({
            where: { id },
            select: { authorId: true }, // 只查作者ID，节省性能
        });

        // 2. skill不存在 或 不是本人创建 → 无权限
        if (!existing || existing.authorId !== userId) {
            return { success: false, error: "无权更新 skill" };
        }

        // 3. 执行更新
        await prisma.skill.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                content: data.content,
                isPublic: data.isPublic,
            },
        });

        // 4. 刷新相关页面缓存
        revalidatePath("/skills");
        revalidatePath(`/skills/${id}`);
        revalidatePath("/dashboard");

        return { success: true, skillId: id };
    } catch (error) {
        console.error("更新skill异常:", error);
        return { success: false, error: "更新skill失败" };
    }
}

/**
 * 删除skill
 * @param id skillID
 * @param userId 当前登录用户ID
 * @returns 删除结果
 */
export async function deleteSkill(
    id: number,
    userId: number
): Promise<ActionResult> {
    try {
        // 1. 先查询skill，校验归属权
        const existing = await prisma.skill.findUnique({
            where: { id },
            select: { authorId: true },
        });

        // 2. 无权限判断
        if (!existing || existing.authorId !== userId) {
            return { success: false, error: "无权删除 skill" };
        }

        // 3. 执行删除
        await prisma.skill.delete({
            where: { id },
        });

        // 4. 刷新缓存
        revalidatePath("/skills");
        revalidatePath("/dashboard");

        return { success: true };
    } catch (error) {
        console.error("删除 skill 异常:", error);
        return { success: false, error: "删除skill失败" };
    }
}