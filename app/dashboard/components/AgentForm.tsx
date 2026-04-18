"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { AgentFormData } from "@/types/agent.type";
import { agentFormFields } from "@/formFields/dashboard/agentFormFields";

type Props = {
	isSubmitting: boolean;
	defaultValues?: AgentFormData;
	onSubmit: (data: AgentFormData) => void;
};

type SkillOption = {
	id: number;
	name: string;
};

const AgentForm = ({ onSubmit, isSubmitting, defaultValues }: Props) => {
	const [skills, setSkills] = useState<SkillOption[]>([]);
	const [loadingSkills, setLoadingSkills] = useState(true);
	const [skillKeyword, setSkillKeyword] = useState("");
	const [isSkillDropdownOpen, setIsSkillDropdownOpen] = useState(false);
	const skillSelectorRef = useRef<HTMLDivElement>(null);

	const {
		register,
		handleSubmit,
		reset,
		control,
		formState: { errors },
	} = useForm<AgentFormData>({
		defaultValues: {
			name: "",
			description: "",
			systemContent: "",
			model: "",
			temperature: 0.2,
			isPublic: true,
			skillIds: [],
		},
	});

	useEffect(() => {
		if (defaultValues) {
			reset({
				...defaultValues,
				description: defaultValues.description ?? "",
				temperature: defaultValues.temperature ?? 0.2,
				isPublic: defaultValues.isPublic ?? true,
				skillIds: defaultValues.skillIds ?? [],
			});
		}
	}, [defaultValues, reset]);

	useEffect(() => {
		const fetchSkills = async () => {
			try {
				const response = await fetch("/api/skills", {
					credentials: "include",
				});
				if (!response.ok) return;
				const data = await response.json();
				setSkills(data.skills || []);
			} catch (error) {
				console.error("获取技能列表失败:", error);
			} finally {
				setLoadingSkills(false);
			}
		};

		fetchSkills();
	}, []);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				skillSelectorRef.current &&
				!skillSelectorRef.current.contains(event.target as Node)
			) {
				setIsSkillDropdownOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const filteredSkills = useMemo(() => {
		const q = skillKeyword.trim().toLowerCase();
		if (!q) return skills;
		return skills.filter((skill) => skill.name.toLowerCase().includes(q));
	}, [skillKeyword, skills]);

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="mt-4">
			{agentFormFields.map((field) => (
				<div key={field.name} className="form-control mt-4">
					<label className="label">
						<span className="label-text">{field.label}</span>
					</label>

					{field.type === "input" ? (
						<input
							type={field.inputType ?? "text"}
							step={field.name === "temperature" ? "0.1" : undefined}
							min={field.name === "temperature" ? 0 : undefined}
							max={field.name === "temperature" ? 2 : undefined}
							placeholder={field.placeholder}
							className="input input-bordered w-full"
							maxLength={field.maxLength}
							{...register(field.name, {
								required: field.required ? `${field.label}不能为空` : false,
								valueAsNumber: field.name === "temperature",
							})}
						/>
					) : (
						<textarea
							placeholder={field.placeholder}
							className="textarea textarea-bordered w-full font-mono text-sm"
							rows={field.rows}
							{...register(field.name, {
								required: field.required ? `${field.label}不能为空` : false,
							})}
						/>
					)}

					{errors[field.name] && (
						<p className="text-red-500 text-sm mt-1">{errors[field.name]?.message}</p>
					)}
				</div>
			))}

			<div className="form-control mt-4">
				<label className="label">
					<span className="label-text">绑定 Skill</span>
				</label>

				{loadingSkills ? (
					<div className="flex items-center py-2">
						<span className="loading loading-spinner loading-sm"></span>
					</div>
				) : skills.length === 0 ? (
					<div className="alert alert-warning">
						<span>你还没有可绑定的 Skill，请先创建 Skill。</span>
					</div>
				) : (
					<Controller
						name="skillIds"
						control={control}
						rules={{
							validate: (value) =>
								(value?.length ?? 0) > 0 ? true : "请至少选择一个 Skill",
						}}
						render={({ field }) => {
							const selectedIds = field.value ?? [];
							const selectedSkills = skills.filter((skill) =>
								selectedIds.includes(skill.id)
							);

							const toggleSkill = (skillId: number) => {
								if (selectedIds.includes(skillId)) {
									field.onChange(selectedIds.filter((id) => id !== skillId));
								} else {
									field.onChange([...selectedIds, skillId]);
								}
							};

							return (
								<div className="space-y-2">
									<div ref={skillSelectorRef} className="relative">
										<input
											type="text"
											value={skillKeyword}
											onFocus={() => setIsSkillDropdownOpen(true)}
											onChange={(e) => {
												setSkillKeyword(e.target.value);
												setIsSkillDropdownOpen(true);
											}}
											placeholder="搜索 Skill 名称"
											className="input input-bordered w-full"
										/>

										{isSkillDropdownOpen && (
											<div className="absolute z-20 mt-2 w-full rounded-lg border border-base-300 bg-base-100 shadow-lg">
												<div className="max-h-56 overflow-auto p-2 space-y-1">
													{filteredSkills.length === 0 ? (
														<div className="px-3 py-2 text-sm text-base-content/60">
															没有匹配的 Skill
														</div>
													) : (
														filteredSkills.map((skill) => {
															const checked = selectedIds.includes(
																skill.id
															);
															return (
																<button
																	key={skill.id}
																	type="button"
																	className={`w-full text-left px-3 py-2 rounded flex items-center justify-between hover:bg-base-200 ${
																		checked ? "bg-base-200" : ""
																	}`}
																	onMouseDown={(e) =>
																		e.preventDefault()
																	}
																	onClick={() =>
																		toggleSkill(skill.id)
																	}
																>
																	<span className="text-sm">
																		{skill.name}
																	</span>
																	{checked && (
																		<span className="badge badge-primary">
																			已选
																		</span>
																	)}
																</button>
															);
														})
													)}
												</div>
											</div>
										)}
									</div>

									<div className="rounded-lg border border-base-300 bg-base-100 p-2">
										<div className="text-xs text-base-content/60 mb-2">
											已选标签
										</div>
										<div className="flex flex-wrap gap-2">
											{selectedSkills.length === 0 ? (
												<span className="text-xs text-base-content/50">
													暂无已选 Skill
												</span>
											) : (
												selectedSkills.map((skill) => (
													<button
														key={skill.id}
														type="button"
														className="badge badge-outline badge-primary gap-1"
														onClick={() => toggleSkill(skill.id)}
													>
														{skill.name} x
													</button>
												))
											)}
										</div>
									</div>
								</div>
							);
						}}
					/>
				)}

				{errors.skillIds && (
					<p className="text-red-500 text-sm mt-1">{errors.skillIds.message}</p>
				)}
			</div>

			<div className="form-control mt-4">
				<label className="label cursor-pointer justify-start gap-4">
					<input
						type="checkbox"
						className="toggle toggle-info"
						{...register("isPublic")}
					/>
					<span className="label-text">公开 Agent</span>
				</label>
				<p className="text-sm text-base-content/60 ml-14">
					公开的 Agent 会显示在资源库中，所有人均可查看
				</p>
			</div>

			<div className="card-actions justify-end mt-6">
				<Link href="/dashboard" className="btn btn-ghost">
					取消
				</Link>
				<button type="submit" className="btn btn-info" disabled={isSubmitting}>
					{isSubmitting ? (
						<>
							<span className="loading loading-spinner loading-sm"></span> 提交中...
						</>
					) : (
						"提交"
					)}
				</button>
			</div>
		</form>
	);
};

export default AgentForm;
