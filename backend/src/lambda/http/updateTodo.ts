import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors, httpErrorHandler } from 'middy/middlewares';
import { UpdateTodo } from '../../businessLogic/todos';


export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const updatedToDo = await UpdateTodo(event);
    return {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true
      },
      statusCode: 200,
      body: JSON.stringify({msg: "The image has been updated", updated: updatedToDo})
    };
  })

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true,
  })
);