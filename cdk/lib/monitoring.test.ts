import '@aws-cdk/assert/jest';
import { SynthUtils } from '@aws-cdk/assert';
import { App } from '@aws-cdk/core';
import { Template } from 'aws-cdk-lib/assertions';
import { Monitoring } from './monitoring';

describe('The Monitoring stack', () => {
	it('matches the snapshot', () => {
		const app = new App();
		const stack = new Monitoring(app, 'CmpMonitoringStack', {
			stack: 'cmp-monitoring',
			stage: 'PROD',
		});
		expect(Template.fromStack(stack).toJSON()).toMatchSnapshot();
	});
});
