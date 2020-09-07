#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { CdkRdsSecretsStack } from '../lib/cdk-rds-secrets-stack';

const app = new cdk.App();
new CdkRdsSecretsStack(app, 'CdkRdsSecretsStack');
