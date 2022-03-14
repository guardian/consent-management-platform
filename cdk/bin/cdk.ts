import 'source-map-support/register';
import { App } from '@aws-cdk/core';
import { Monitoring } from '../lib/monitoring';
import { GuStackProps } from '@guardian/cdk/lib/constructs/core';

const app = new App();
const cloudFormationStackName = process.env.GU_CFN_STACK_NAME;

const props: GuStackProps = {
  stack: "cmp-monitoring",
  env: {
    region: "eu-west-1",
  },
};

new Monitoring(app, 'CmpMonitoringStack', props);
