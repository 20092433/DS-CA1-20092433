#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { AuthAppStack } from '../lib/auth-app-stack';
import { RecipeApiStack } from '../lib/recipe-api-stack';

const app = new cdk.App();

new AuthAppStack(app, 'AuthAPIStack', {
    env: { region: 'eu-west-1' },
});

new RecipeApiStack(app, 'RecipeApiStack', {
    env: { region: 'eu-west-1' },
});

