const SkeletonScreen = () => {
	return (
		<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
			{[1, 2, 3].map((i) => (
				<div key={i} className="card bg-base-200">
					<div className="card-body">
						<div className="skeleton h-6 w-3/4"></div>
						<div className="skeleton h-4 w-full mt-2"></div>
						<div className="skeleton h-8 w-24 mt-4"></div>
					</div>
				</div>
			))}
		</div>
	);
};

export default SkeletonScreen;
