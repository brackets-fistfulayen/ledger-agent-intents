import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
}

interface State {
	hasError: boolean;
	error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error("ErrorBoundary caught:", error, errorInfo);
	}

	render() {
		if (this.state.hasError && this.state.error) {
			if (this.props.fallback) {
				return this.props.fallback;
			}
			return (
				<div className="flex min-h-[200px] flex-col items-center justify-center gap-16 p-24">
					<p className="body-1 text-muted">Something went wrong.</p>
					<button
						type="button"
						className="body-2-semi-bold rounded-lg bg-accent px-16 py-8 text-on-accent hover:bg-accent-hover"
						onClick={() => this.setState({ hasError: false, error: null })}
					>
						Try again
					</button>
				</div>
			);
		}
		return this.props.children;
	}
}
