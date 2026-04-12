export class CLIError extends Error {
	constructor(
		message: string,
		public exitCode = 1,
	) {
		super(message);
		this.name = "CLIError";
	}
}
