/* eslint-disable no-unused-vars */
declare global {
	namespace NodeJS {
		interface ProcessEnv {
			DSTOKEN: string;
			geniusKey: string;
		}
	}
}
export { };
