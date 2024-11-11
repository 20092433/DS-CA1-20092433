## Serverless REST Assignment - Distributed Systems.

__Name: Adam McNamara

__Demo: https://youtu.be/6ZMEI_4YoYw

### Context.

For this assignment the context of my web API is recipes I used the cognito lab as a base as I hoped to intergrate it with my recipe stack, I populated the database with seed data that deployed a number  of recipes in the dynamoDB table when the stack is deployed, the attributes stored for recipe in the dynamoDB table are:

- **title**: Name of the recipe
- **instructions**: How to cook using the recipe
- **recipeID**: Unique identifier of the recipe
- **ingredients**: Individual food needed to make up a recipe
- **cookingTime**: Amount of time needed to cook up the recipe


I attempted to add authentication with my recipe table but was unsuccessful.

### App API endpoints.



- `GET /recipes` - retrieve all recipes
- `POST /recipes` - add a new recipe
- `GET /recipes/{recipeID}` - retrieve a recipe with a specific ID
- `DELETE /recipes/{recipeID}` - delete a recipe with a specific ID



