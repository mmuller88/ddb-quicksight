import * as glue from '@aws-cdk/aws-glue';
import * as cdk from '@aws-cdk/core';

interface GlueStackProps extends cdk.StackProps {
  readonly tableName: string;
}

export class GlueStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: GlueStackProps) {
    super(scope, id, props);

    const database = new glue.Database(this, 'Database', {
      databaseName: props.tableName,
      locationUri: 'dynamo-db-flag',
    });

    const gluetable = new glue.Table(this, 'GlueTable', {
      tableName: props.tableName,
      database: database,
      columns: [{
        name: 'userid',
        type: glue.Schema.BIG_INT,
      }, {
        name: 'firstname',
        type: glue.Schema.STRING,
      }],
      dataFormat: glue.DataFormat.JSON,
    });

    const cfngluetable = gluetable.node.defaultChild as glue.CfnTable;
    cfngluetable.addPropertyOverride('TableInput.Parameters.classification', 'dynamodb');
    cfngluetable.addPropertyOverride('TableInput.Parameters.columnMapping', 'userid=userId,firstname=firstName');
  }
}