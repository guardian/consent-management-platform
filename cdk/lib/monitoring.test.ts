import { App } from 'aws-cdk-lib';
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
