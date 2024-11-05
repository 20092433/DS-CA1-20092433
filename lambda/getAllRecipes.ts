import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

//initialises the DynamoDB document client for executing commands against the DB
const ddbDocClient = createDDbDocClient();

//tbe main function that processes incoming API requests.
export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
  try {
    // Print Event
    //Logs the incoming event for debugging
    console.log("Event: ", event);


    //executes scan command on the specified DynamoDB table to retrieve all items.
    const commandOutput = await ddbDocClient.send(
      new ScanCommand({
        TableName: process.env.TABLE_NAME, // Ensure this points to your recipes table
      })
    );

    // Check for items if none are returned gives 404 status
    if (!commandOutput.Items || commandOutput.Items.length === 0) {
      return {
        statusCode: 404,
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ message: "No recipes found" }), // Update message
      };
    }

    //if recipes found it formats and returns them 
    const body = {
      data: commandOutput.Items,
    };

    // Return Response
    return {
      statusCode: 200,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    };
  } catch (error: any) {
    console.log(JSON.stringify(error));
    return {
      statusCode: 500,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ error }),
    };
  }
};

//Initalizes the dynamoDB client with specified options
function createDDbDocClient() {
  const ddbClient = new DynamoDBClient({ region: process.env.REGION });
  const marshallOptions = {
    convertEmptyValues: true,
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  };
  const unmarshallOptions = {
    wrapNumbers: false,
  };
  const translateConfig = { marshallOptions, unmarshallOptions };
  return DynamoDBDocumentClient.from(ddbClient, translateConfig);
}
