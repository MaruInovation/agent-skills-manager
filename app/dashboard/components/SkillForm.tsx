"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { SkillFormData } from "@/types/skill.type";
import { formFields } from "@/formFields/dashboard/skillFormFields";

type Props = {
	isSubmitting: boolean;
	defaultValues?: SkillFormData;
	onSubmit: (data: SkillFormData) => void;
};

const SkillForm = ({ onSubmit, isSubmitting, defaultValues }: Props) => {
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<SkillFormData>({
		defaultValues: {
			name: "",
			description: "",
			tags: "",
			inputSchema: "",
			outputSchema: "",
			content: "",
			errorHandling: "",
			examples: "",
			isPublic: true,
		},
	});

	useEffect(() => {
		if (defaultValues) {
			reset(defaultValues);
		}
	}, [defaultValues, reset]);

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="mt-4">
			{formFields.map((field) => (
				<div key={field.name} className="form-control mt-4">
					<label className="label">
						<span className="label-text">{field.label}</span>
					</label>

					{field.type === "input" ? (
						<input
							type="text"
							placeholder={field.placeholder}
							className="input input-bordered w-full"
							maxLength={field.maxLength}
							{...register(field.name, {
								required: field.required ? `${field.label}不能为空` : false,
							})}
						/>
					) : (
						<textarea
							placeholder={field.placeholder}
							className="textarea textarea-bordered w-full font-mono text-sm skill-content"
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
				<label className="label cursor-pointer justify-start gap-4">
					<input
						type="checkbox"
						className="toggle toggle-primary"
						{...register("isPublic")}
					/>
					<span className="label-text">公开 skill</span>
				</label>
				<p className="text-sm text-base-content/60 ml-14">
					公开的 skill 会显示在资源库中，所有人均可查看
				</p>
			</div>

			<div className="card-actions justify-end mt-6">
				<Link href="/dashboard" className="btn btn-ghost">
					取消
				</Link>
				<button type="submit" className="btn btn-primary" disabled={isSubmitting}>
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

export default SkillForm;
