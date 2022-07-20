import '@aws-cdk/assert/jest';
import { SynthUtils } from '@aws-cdk/assert';
import { App, Stage } from '@aws-cdk/core';
import { Monitoring } from './monitoring';

describe('The Monitoring stack', () => {
	it('matches the snapshot', () => {
		const app = new App();
		const stack = new Monitoring(app, 'CmpMonitoringStack', {
			stack: 'cmp-monitoring',
			stage: 'PROD',
		});
		expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
	});
});
