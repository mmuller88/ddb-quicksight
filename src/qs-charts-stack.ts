/* eslint-disable @typescript-eslint/no-require-imports */
import * as qs from '@aws-cdk/aws-quicksight';
import * as cdk from '@aws-cdk/core';

export interface QSChartsStackProps extends cdk.StackProps {
  /**
   * Describes the actual running stage environment like dev, qa, prod
   */
  readonly stage: string;
  readonly prodEnvId: string;
}
export class QSChartsStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: QSChartsStackProps) {
    super(scope, id, props);

    const topPrescreptionAnalysis = 'topPrescreptionAnalysis';
    const dataSetPlaceholder = 'martin-test-v1';

    // save dev QuickSight analysis as template
    if (props.stage === 'dev') {
      new qs.CfnTemplate(this, 'Template', {
        awsAccountId: this.account,
        name: topPrescreptionAnalysis,
        templateId: topPrescreptionAnalysis,
        permissions: [{
          principal: `arn:aws:iam::${props.prodEnvId}:root`,
          actions: ['quicksight:UpdateTemplatePermissions', 'quicksight:DescribeTemplate'],
        }],
        sourceEntity: {
          sourceAnalysis: {
            arn: `arn:aws:quicksight:${this.region}:${this.account}:analysis/35c6dcea-ddd3-48e6-af01-f37857b30c7d`,
            dataSetReferences: [{
              dataSetArn: `arn:aws:quicksight:${this.region}:${this.account}:dataset/d1a35afe-689c-43f6-8dd7-4bfeed6670dd`,
              dataSetPlaceholder: dataSetPlaceholder,
            }],
          },
        },
      });
    }

    // create prod QuickSight analysis from dev template
    if (props.stage === 'prod') {
      new qs.CfnAnalysis(this, 'Analysis', {
        awsAccountId: this.account,
        name: topPrescreptionAnalysis,
        analysisId: topPrescreptionAnalysis,
        sourceEntity: {
          sourceTemplate: {
            arn: `arn:aws:quicksight:${this.region}:918366877282:template/${topPrescreptionAnalysis}`,
            dataSetReferences: [{
              dataSetArn: `arn:aws:quicksight:${this.region}:${this.account}:dataset/d1a35afe-689c-43f6-8dd7-4bfeed6670dd`,
              dataSetPlaceholder: dataSetPlaceholder,
            }],
          },
        },
      });
    }


    // new qs.CfnDashboard(this, 'Dashboard', {
    //   awsAccountId: this.account,
    //   dashboardId: 'ddbdashboard',
    //   name: 'ddbdashboard',
    //   // permissions: [{
    //   //   principal: 'arn:aws:quicksight:eu-central-1:981237193288:user/default/981237193288',
    //   //   actions: [
    //   //     'quicksight:DescribeDashboard',
    //   //     'quicksight:ListDashboardVersions',
    //   //     'quicksight:UpdateDashboardPermissions',
    //   //     'quicksight:QueryDashboard',
    //   //     'quicksight:UpdateDashboard',
    //   //     'quicksight:DeleteDashboard',
    //   //     'quicksight:DescribeDashboardPermissions',
    //   //     'quicksight:UpdateDashboardPublishedVersion',
    //   //   ],
    //   // }],
    //   sourceEntity: {
    //     sourceTemplate: {
    //       dataSetReferences: [
    //         {
    //           dataSetPlaceholder: 'testtable',
    //           dataSetArn: 'arn:aws:quicksight:eu-central-1:981237193288:dataset/8480f9e7-48a4-4cf0-9cdd-f0ca014bd8d8',

    //         },
    //       ],
    //       arn: 'arn:aws:quicksight:us-east-1:981237193288:template/analysis-1',
    //     },
    //   },
    //   versionDescription: '1',
    // });

  }
}