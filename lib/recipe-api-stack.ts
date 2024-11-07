import * as cdk from "aws-cdk-lib"; // Main CDK library
import * as lambda from "aws-cdk-lib/aws-lambda"; // For AWS Lambda
import * as lambdanode from "aws-cdk-lib/aws-lambda-nodejs"; // For Node.js Lambda functions
import * as dynamodb from "aws-cdk-lib/aws-dynamodb"; // For DynamoDB
import * as custom from "aws-cdk-lib/custom-resources"; // For custom resources
import * as apig from "aws-cdk-lib/aws-apigateway"; // For API Gateway
import { Construct } from "constructs"; // For CDK constructs
import * as iam from "aws-cdk-lib/aws-iam"; // For IAM policies (if you need it)
//import * as custom from "aws-cdk-lib/custom-resources";
import { generateRecipeBatch } from "../shared/utils";
import {recipes} from "../seed/recipes";


export class RecipeApiStack extends cdk.Stack {

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
      super(scope, id, props);
//tables
const recipesTable = new dynamodb.Table(this, "RecipesTable", {
    billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    partitionKey: { name: "recipeId", type: dynamodb.AttributeType.NUMBER }, // or NUMBER, based on your design
    removalPolicy: cdk.RemovalPolicy.DESTROY,
    tableName: "Recipes",
  });


  //lambda functions
  const getRecipeByIdFn = new lambdanode.NodejsFunction(this, "GetRecipeByIdFn", {
    runtime: lambda.Runtime.NODEJS_18_X,
    entry: `${__dirname}/../lambda/getRecipeById.ts`,
    environment: {
      TABLE_NAME: recipesTable.tableName,
    },
  });
  
  const getAllRecipesFn = new lambdanode.NodejsFunction(this, "GetAllRecipesFn", {
    runtime: lambda.Runtime.NODEJS_18_X,
    entry: `${__dirname}/../lambda/getAllRecipes.ts`,
    environment: {
      TABLE_NAME: recipesTable.tableName,
    },
  });
  
  const addRecipeFn = new lambdanode.NodejsFunction(this, "AddRecipeFn", {
    runtime: lambda.Runtime.NODEJS_18_X,
    entry: `${__dirname}/../lambda/addRecipe.ts`,
    environment: {
      TABLE_NAME: recipesTable.tableName,
    },
  });
  
  const deleteRecipeFn = new lambdanode.NodejsFunction(this, "DeleteRecipeFn", {
    runtime: lambda.Runtime.NODEJS_18_X,
    entry: `${__dirname}/../lambda/deleteRecipe.ts`,
    environment: {
      TABLE_NAME: recipesTable.tableName,
    },
  });


  new custom.AwsCustomResource(this, "recipesDbInitData", {
    onCreate: {
      service: "DynamoDB",
      action: "batchWriteItem",
      parameters: {
        RequestItems: {
          [recipesTable.tableName]: generateRecipeBatch(recipes),
        },
      },
      physicalResourceId: custom.PhysicalResourceId.of("recipesDbInitData"),
    },
    

    policy: custom.AwsCustomResourcePolicy.fromSdkCalls({
      resources: [recipesTable.tableArn],
    }),
  });
  
  


//permissions
recipesTable.grantReadData(getRecipeByIdFn);
recipesTable.grantReadData(getAllRecipesFn);
recipesTable.grantReadWriteData(addRecipeFn);
recipesTable.grantReadWriteData(deleteRecipeFn);


//API Gateway to expose Lambda functions
const api = new apig.RestApi(this, "RecipeApi", {
    description: "API for managing recipes",
    deployOptions: {
      stageName: "dev",
    },
    defaultCorsPreflightOptions: {
      allowHeaders: ["Content-Type", "X-Amz-Date"],
      allowMethods: ["OPTIONS", "GET", "POST", "DELETE"],
      allowCredentials: true,
      allowOrigins: ["*"],
    },
  });
  
  const recipesEndpoint = api.root.addResource("recipes");
  
  recipesEndpoint.addMethod("GET", new apig.LambdaIntegration(getAllRecipesFn, { proxy: true }));
  recipesEndpoint.addMethod("POST", new apig.LambdaIntegration(addRecipeFn, { proxy: true }));
  
  const recipeEndpoint = recipesEndpoint.addResource("{recipeId}");
  recipeEndpoint.addMethod("GET", new apig.LambdaIntegration(getRecipeByIdFn, { proxy: true }));
  recipeEndpoint.addMethod("DELETE", new apig.LambdaIntegration(deleteRecipeFn, { proxy: true }));
  
}
}