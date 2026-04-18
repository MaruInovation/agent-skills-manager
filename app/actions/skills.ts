"use server";

import { prisma } from "@/lib/prisma";
import { SkillFormData } from "@/types/skill.type";
import { revalidatePath } from "next/cache";



interface ActionResult {
    success: boolean;
    error?: string;
    skillId?: number;
}





export async function createSkill(
    data: SkillFormData,
    userId: number
): Promise<ActionResult> {


    console.log('当前运行时:', typeof window === 'undefined' ? 'server' : 'client');
    console.log('是否有 process.env:', typeof process !== 'undefined');
    console.log('是否有 process.version:', typeof process !== 'undefined' ? process.version : 'no');


    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });





        if (!user) {
            return { success: false, error: "用户不存在" };
        }

        const skill = await prisma.skill.create({
            data: {
                ...data,
                authorId: userId,
            },
        });








        revalidatePath("/skills");
        revalidatePath("/dashboard");

        return { success: true, skillId: skill.id };
    } catch (error) {
        console.error("创建skill异常:", error);
        return { success: false, error: "创建skill失败" };
    }
}

export async function updateSkill(
    id: number,
    data: SkillFormData,
    userId: number
): Promise<ActionResult> {
    try {
        const existing = await prisma.skill.findUnique({
            where: { id },
            select: { authorId: true },
        });

        if (!existing || existing.authorId !== userId) {
            return { success: false, error: "无权更新skill" };
        }

        await prisma.skill.update({
            where: { id },
            data,
        });

        revalidatePath("/skills");
        revalidatePath(`/skills/${id}`);
        revalidatePath("/dashboard");

        return { success: true, skillId: id };
    } catch (error) {
        console.error("更新skill失败:", error);
        return { success: false, error: "更新skill失败" };
    }
}

export async function deleteSkill(
    id: number,
    userId: number
): Promise<ActionResult> {
    try {
        const existing = await prisma.skill.findUnique({
            where: { id },
            select: { authorId: true },
        });

        if (!existing || existing.authorId !== userId) {
            return { success: false, error: "无权删除skill" };
        }

        await prisma.skill.delete({
            where: { id },
        });

        revalidatePath("/skills");
        revalidatePath("/dashboard");

        return { success: true };
    } catch (error) {
        console.error("删除skill失败:", error);
        return { success: false, error: "删除skill失败" };
    }
}
