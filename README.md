# ddb-quicksight

The AWS CDK DynamoDB Athena QuickSight setup aims for maximum automation for setting up all needed resources, policies, roles and so on.

This is part of the blogpost: https://martinmueller.dev/cdk-ddb-quicksight-eng

# Helpful Resources

- https://dev.to/jdonboch/finally-dynamodb-support-in-aws-quicksight-sort-of-2lbl As much as possible I tried to automate with AWS CDK but there are still manual steps you need to follow. A lot of them you find in that url.

# Limitations

- Creating QuickSight DataSets with Cloudformation / AWS CDK isn't actually supported https://github.com/aws-cloudformation/aws-cloudformation-coverage-roadmap/issues/274 .

# Deploy Instructions for the DynamoDB Athena Stack

They are a bit tricky because the AthenaDynamoDBConnector Lambda needs to be installed manually :-/.

Preconditions:

- Ensure you setup QuickSight with the AWS Console.
- If you want to use an existing DynamoDB Table comment in **dynamodb.Table.fromTableArn** and replace the arn of the table. Comment out the dynamodb.Table(this, ...) and the DynamoDBSeeder as you don't need that because you are using an imported table.

Steps:

1. In AWS IAM look for the QuickSight role with the name similar to aws-quicksight-service-role-v0 and copy the arn
2. Copy / Replace the Arn into the CDK stack.
3. Comment out the CDK resources athena.CfnDataCatalog and lambda.Function
4. run `yarn deploy` and confirm to create the stack
5. create the AthenaDynamoDBConnector Lambda:
   a) In AWS Console go to Athena --> Data sources --> Connect data source
   b) Choose Query a data source --> Amazon DynamoDB --> Next --> Configure New AWS Lambda function
   c) For SpillBucket and AthenaCatalogName take the names from the CDK Stack
6. From the created Lambda take the arn and copy / replace it into the CDK stack
7. comment in those resources from step one
8. run `yarn deploy` and confirm to update the stack
9. Go to QuickSight and setup the DataSet, Analysis and Dashboards

# Deploy Instructions for the QuickSight Analysis

This instructions allow you to migrate your dev QuickSight Analysis to the prod account.

Preconditions:

- You created one ore more QuickSight Analysis
- QuickSight is enabled and on the enterprise tier

1. In the main.ts only comment in the two QSChartsStack cdk resources
2. Run the dev stack with `yarn cdkDeploy 'qs-charts-stack-dev' --require-approval never --profile dev`
3. Run the prod stack with `yarn cdkDeploy 'qs-charts-stack-prod' --require-approval never --profile prod`

# Destroy Instructions

Destroy the CDK stack with

```
yarn destroy
```

# QuickSight

AWS CDK QuickSight would allow to share manual created Analysis with using the API to extracting a template and than create Analysis and Dashboards out of it. But I don't think that is require atm.

## Helpful Resources

- https://aws.amazon.com/de/premiumsupport/knowledge-center/quicksight-cross-account-template/
- https://awscli.amazonaws.com/v2/documentation/api/latest/reference/quicksight/index.html
- API https://docs.aws.amazon.com/quicksight/latest/APIReference/API_Operations.html

## List DataSets

1. Get the dataset arn `aws quicksight list-data-sets --aws-account-id 981237193288 --region us-east-1`
2. Get the user arn `aws quicksight list-users --aws-account-id 981237193288 --namespace default --region us-east-1`

## List Templates

`aws quicksight list-templates --aws-account-id 981237193288`

## Template Permissions

`aws quicksight describe-template-permissions --aws-account-id 981237193288 --template-id topPrescreptionAnalysis`

# Projen

[Projen](https://github.com/projen/projen) is used to manage the Github TypeScript AWS CDK setup. It is developed and maintained from the AWS CDK Community and the favorite framework to manage those AWS CDK project setups.

Main benefits of that are:

- managing the cdk dependencies and cdk commands like `yarn deploy`
- managing the node and github config files
- a standardized way of how to setup AWS CDK repos

# Troubleshooting

Don't forget to update cdk and optionally [projen](https://github.com/projen/projen) Bootstrap you region e.g.:

```
sudo npm install -g cdk
sudo npm install -g projen

cdk bootstrap --trust 111111111 --force --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess aws://22222222/ca-central-1 --profile default
```

## QuickSight

- If you have an error in QuickSight please check if Athena is querying correctly at all
- During the setup the data of the **chiefComplaint** column is corrupted as it has different types which blow the connector. In QuickSight when you create the DataSet you can exclude corrupted columns and than just start the query again.

# Improvement Ideas

- It would be nice to have the AthenaDynamoDBConnector Lambda created / managed with AWS CDK as well but that is tricky atm. It would require to copy / run the build from that AWS Repo https://github.com/awslabs/aws-athena-query-federation/blob/master/athena-dynamodb/athena-dynamodb.yaml

- As well it would be possible to create a DataSet AWS CDK Custom Construct with using CDK Custom Resource and https://docs.aws.amazon.com/quicksight/latest/APIReference/API_Operations.html to automate the creation of the DataSet. For now it will be created manually

# Useful

Quick iterating:

```
yes | yarn cdkDestroy && yarn cdkDeploy --require-approval never
```
