#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CdktwitterStack } from '../lib/cdktwitter-stack';
import { table } from 'console';


const app = new cdk.App();

new CdktwitterStack(app, 'CdktwitterStack', {
  env: { account: '536233321899', region: 'us-east-1' },
});
