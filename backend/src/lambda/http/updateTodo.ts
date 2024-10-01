import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors, httpErrorHandler } from 'middy/middlewares';
import { UpdateTodo } from '../../businessLogic/todos';
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest';

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
    } catch (error) {
      return {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        statusCode: 500,
        body: JSON.stringify({ error: error }),
      };
    }
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body);
    await UpdateTodo(event);
    return {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      statusCode: 204,
      body: JSON.stringify({ item: updatedTodo }),
    };
  }
);

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true,
  })
);