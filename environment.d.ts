/* eslint-disable no-unused-vars */
declare global {
	namespace NodeJS {
		interface ProcessEnv {
			DSTOKEN: string;
			guildId: string;
			environment: 'dev' | 'prod' | 'debug';
		}
	}
}
export { };
