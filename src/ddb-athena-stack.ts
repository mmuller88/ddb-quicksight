/* eslint-disable @typescript-eslint/no-require-imports */
import * as athena from '@aws-cdk/aws-athena';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as iam from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import * as s3 from '@aws-cdk/aws-s3';
import * as cdk from '@aws-cdk/core';
import { DynamoDBSeeder, Seeds } from '@cloudcomponents/cdk-dynamodb-seeder';


export class DdbAthenaStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: cdk.StackProps = {}) {
    super(scope, id, props);

    // const table = dynamodb.Table.fromTableArn(this, 'Table', 'arn:aws:lambda:eu-central-1:918366877282:dynamodb:martin-test-v1');
    const table = new dynamodb.Table(this, 'Table', {
      tableName: 'testtable',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      partitionKey: { name: 'ID', type: dynamodb.AttributeType.STRING },
    });

    new DynamoDBSeeder(this, 'InlineSeeder', {
      table,
      // seeds: Seeds.fromJsonFile('src/ddb.json'),
      seeds: Seeds.fromInline([
        {
          ID: '3',
          chiefComplaint: { complaint: 'foo' },
        },
        {
          ID: '4',
          chiefComplaint: { complaint: 'bar' },
        },
      ]),
    });

    const spillbucket = new s3.Bucket(this, 'SpillBucket', {
      bucketName: 'spillbucketreliant',
      autoDeleteObjects: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const outputBucket = new s3.Bucket(this, 'outputBucket', {
      bucketName: 'outputbucketddbreliant',
      autoDeleteObjects: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    new athena.CfnWorkGroup(this, 'workgroup', {
      name: 'ddbworkgroup',
      recursiveDeleteOption: true,
      workGroupConfiguration: {
        resultConfiguration: {
          outputLocation: outputBucket.s3UrlForObject(),
        },
        engineVersion: {
          selectedEngineVersion: 'Athena engine version 2',
        },
      },
    });

    // workaround please see Readme #AthenaDynamoDBConnector Lambda
    const connector = lambda.Function.fromFunctionArn(this, 'ddbconnector', `arn:aws:lambda:${this.region}:${this.account}:function:ddbconnector`);

    new athena.CfnDataCatalog(this, 'datacatalog', {
      name: 'ddbconnector',
      type: 'LAMBDA',
      parameters: {
        function: connector.functionArn,
      },
    });

    // allowing quicksight to access Lambdas
    // const qsrole = new iam.Role(this, 'QuickSightRole', {
    //   assumedBy: new iam.ServicePrincipal('quicksight.amazonaws.com'),
    // });
    const qsrole = iam.Role.fromRoleArn(this, 'QuickSightRoleImport', `arn:aws:iam::${this.account}:role/service-role/aws-quicksight-service-role-v0`);

    // qsrole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess'),)
    qsrole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSQuicksightAthenaAccess'));
    qsrole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AWSLambdaRole'));
    qsrole.addToPrincipalPolicy(new iam.PolicyStatement({
      actions: ['s3:ListAllMyBuckets'],
      resources: ['*'],
    }));
    qsrole.addToPrincipalPolicy(new iam.PolicyStatement({
      actions: [
        's3:ListBucket',
        's3:ListBucketMultipartUploads',
        's3:GetBucketLocation',
      ],
      resources: [
        spillbucket.bucketArn,
        outputBucket.bucketArn,
      ],
    }));
    qsrole.addToPrincipalPolicy(new iam.PolicyStatement({
      actions: [
        's3:GetObject',
        's3:GetObjectVersion',
        's3:PutObject',
        's3:AbortMultipartUpload',
        's3:ListMultipartUploadParts',
      ],
      resources: [
        spillbucket.bucketArn + '/*',
        outputBucket.bucketArn + '/*',
      ],
    }));
  }
}