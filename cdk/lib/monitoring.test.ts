import '@aws-cdk/assert/jest';
import { SynthUtils } from '@aws-cdk/assert';
import { App } from '@aws-cdk/core';
import { Monitoring } from './monitoring';

describe('The Monitoring stack', () => {
	it('matches the snapshot', () => {
		const app = new App();
		const stack = new Monitoring(app, 'CmpMonitoringStack', {
			stack: 'cmp-monitoring',
		});
		expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
	});
});
