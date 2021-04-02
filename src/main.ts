import * as cdk from '@aws-cdk/core';
import { DdbAthenaStack } from './ddb-athena-stack';
import { QSChartsStack } from './qs-charts-stack';


const devEnv = {
  account: '981237193288',
  region: 'eu-central-1',
};

const prodEnv = {
  account: '',
  region: 'eu-central-1',
};

const app = new cdk.App();

new DdbAthenaStack(app, 'ddb-stack-dev', { env: devEnv });
new DdbAthenaStack(app, 'ddb-stack-prod', { env: prodEnv });

new QSChartsStack(app, 'qs-charts-stack-dev', {
  env: devEnv,
  stage: 'dev',
  prodEnvId: prodEnv.account,
});

new QSChartsStack(app, 'qs-charts-stack-prod', {
  env: prodEnv,
  stage: 'prod',
  prodEnvId: prodEnv.account,
});

app.synth();