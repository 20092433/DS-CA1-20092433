import { marshall } from "@aws-sdk/util-dynamodb";
import { Recipe } from "./types"; // Adjust path if needed

// Function to convert a single recipe to DynamoDB format
export const generateRecipeItem = (recipe: Recipe) => {
  return {
    PutRequest: {
      Item: marshall(recipe),
    },
  };
};

// Function to generate a batch of recipes for seeding
export const generateRecipeBatch = (data: Recipe[]) => {
  return data.map((recipe) => generateRecipeItem(recipe));
};
