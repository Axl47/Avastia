declare global {
	namespace NodeJS {
		interface ProcessEnv {
			DSTOKEN: string;
			geniusKey: string;
		}
	}
}
export { };
