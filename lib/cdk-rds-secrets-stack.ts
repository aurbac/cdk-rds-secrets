import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as rds from '@aws-cdk/aws-rds';
import * as kms from '@aws-cdk/aws-kms';
import * as secretsmanager from '@aws-cdk/aws-secretsmanager';

export class CdkRdsSecretsStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    
    const vpc = new ec2.Vpc(this, "workshop-vpc", {
      cidr: "10.1.0.0/16",
      natGateways: 1,
      subnetConfiguration: [
        {  cidrMask: 24, subnetType: ec2.SubnetType.PUBLIC, name: "Public" },
        {  cidrMask: 24, subnetType: ec2.SubnetType.PRIVATE, name: "Private" }
        ],
      maxAzs: 3 // Default is all AZs in region
    });
  
    const key = new kms.Key(this,'mykey');
    
    const instance = new rds.DatabaseInstance(this, 'Instance', {
      engine: rds.DatabaseInstanceEngine.MYSQL,
      // optional, defaults to m5.large
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE2, ec2.InstanceSize.SMALL),
      masterUsername: 'syscdk',
      deletionProtection: false,
      masterUserPasswordEncryptionKey: key,
      vpc,
      vpcPlacement: {
        subnetType: ec2.SubnetType.PRIVATE
      }
    });
    
    // Allow connections on default port from any IPV4
    instance.connections.allowDefaultPortFromAnyIpv4();

    // Rotate the master user password every 30 days
    instance.addRotationSingleUser(cdk.Duration.days(2));
    
    const dbSecret = instance.node.tryFindChild('Secret') as rds.DatabaseSecret;
    
    new cdk.CfnOutput(this, 'RDSInstanceEndpoint', { value: instance.instanceEndpoint.hostname });
    new cdk.CfnOutput(this, 'RDSInstanceEndpointPort', { value: instance.instanceEndpoint.port.toString() });
    new cdk.CfnOutput(this, 'MyUserSecretArn', { value: dbSecret.secretArn });
    
  }
}
