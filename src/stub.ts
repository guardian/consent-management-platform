import { stub_ccpa } from './stub_ccpa';
import { stub_gpp_ccpa } from './stub_gpp_ccpa';
import { stub_tcfv2 } from './stub_tcfv2';
import type { Framework } from './types';

export const stub = (framework: Framework): void => {
	// NOTE - Contrary to the SourcePoint documentation, it's important that we only run the stub file
	// for the framework currently in use. The presence of __tcfapi on the window object signals to GPT
	// that it should take precedence over __uspapi
	// documentation.sourcepoint.com/implementation/web-implementation/multi-campaign-web-implementation#stub-file

	switch (framework) {
		case 'tcfv2':
			stub_tcfv2()
			console.log("TCFV2")
			break;
		case 'ccpa':
			stub_ccpa();
			console.log("CCPA", "CCPA")

			stub_gpp_ccpa();
			console.log("GPP", "CCPA")

		case 'aus':
			stub_ccpa();
			console.log("CCPA", "AUS")

		default:
			break;
	}
};
