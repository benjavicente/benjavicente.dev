import "./card.css";
import clsx from "clsx";

export function Root({ children, className, horizontal }: { children: React.ReactNode; className?: string; horizontal?: boolean }) {
	return (
		<div
			className={clsx(
				`not-prose card-root mx-auto`,
				className,
				horizontal === undefined
					? null
					: {
							"flow-row": horizontal,
							"flow-col": !horizontal,
						},
			)}
		>
			{children}
		</div>
	);
}

export function Title({ children }: { children: React.ReactNode }) {
	return <h2 className="card-title">{children}</h2>;
}

export function Content({ children }: { children: React.ReactNode }) {
	return <p className="card-description">{children}</p>;
}

export function Divider({ className }: { className?: string }) {
	return <div className={clsx("card-divider", className)} />;
}
