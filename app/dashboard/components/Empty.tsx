import Link from 'next/link';
import React from 'react';

type Props = {
	title: string;
	href: string;
};

const Empty = ({ title, href }: Props) => {
	return (
		<div className="text-center py-12 bg-base-200 rounded-lg">
			<div className="text-4xl mb-4">📝</div>
			<h3 className="text-lg font-semibold mb-2">暂无 {title}</h3>
			<p className="text-base-content/70 mb-4">
				创建你的第一个 {title} 开始使用吧
			</p>
			<Link href={href} className="btn btn-secondary">
				创建 {title}
			</Link>
		</div>
	);
};

export default Empty;
