'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import SkillCard from './components/SkillCard';
import AgentCard from './components/AgentCard';

enum SelectStateEnum {
	Skill = 'Skill',
	Agent = 'Agent',
}

export default function DashboardPage() {
	const { user, isAuthenticated, isLoading } = useAuth();
	const router = useRouter();
	const searchParams = useSearchParams();
	const nowState =
		searchParams.get('tab') === 'agent'
			? SelectStateEnum.Agent
			: SelectStateEnum.Skill;

	if (isLoading) {
		return (
			<div className="flex justify-center items-center min-h-[50vh]">
				<span className="loading loading-spinner loading-lg"></span>
			</div>
		);
	}

	if (!isAuthenticated) {
		return null;
	}

	const selectAgentOrSkill = () => {
		if (nowState === SelectStateEnum.Skill) {
			router.replace('/dashboard?tab=agent');
		} else {
			router.replace('/dashboard?tab=skill');
		}
	};

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="flex justify-between items-center mb-8">
				<div className="flex gap-5">
					<div>
						<h1 className="text-3xl font-bold">控制台</h1>
						<p className="text-base-content/70 mt-1">欢迎回来，{user?.name}</p>
					</div>
					<div
						className={`badge cursor-pointer ${nowState === SelectStateEnum.Skill ? 'badge-info' : 'badge-primary'}`}
						onClick={selectAgentOrSkill}
					>
						{nowState === SelectStateEnum.Skill
							? SelectStateEnum.Agent
							: SelectStateEnum.Skill}
					</div>
				</div>

				<div className="flex">
					<Link
						href={`/dashboard/${nowState === SelectStateEnum.Skill ? 'skills' : 'agents'}/new`}
						className={`btn ${nowState === SelectStateEnum.Skill ? 'btn-primary' : 'btn-info'}`}
					>
						+ 新建 {nowState}
					</Link>
				</div>
			</div>

			{nowState === SelectStateEnum.Skill ? <SkillCard /> : <AgentCard />}
		</div>
	);
}
