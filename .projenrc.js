const { AwsCdkTypeScriptApp } = require('projen');

const project = new AwsCdkTypeScriptApp({
  cdkVersion: '1.73.0',
  defaultReleaseBranch: 'main',
  jsiiFqn: "projen.AwsCdkTypeScriptApp",
  name: 'ddb-quicksight',

  cdkDependencies: [
    '@aws-cdk/aws-iam',
    '@aws-cdk/aws-dynamodb',
    '@aws-cdk/aws-athena',
    '@aws-cdk/aws-s3',
    '@aws-cdk/aws-lambda',
    '@aws-cdk/aws-glue',
    '@aws-cdk/aws-quicksight',
  ],
  deps: [
    '@cloudcomponents/cdk-dynamodb-seeder',
  ],
});

project.synth();
