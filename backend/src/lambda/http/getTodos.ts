import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors } from 'middy/middlewares';
import { getTodosForUser as getTodosForUser } from '../../businessLogic/todos';
import { getUserId } from '../utils';


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
    const todos = await getTodosForUser(getUserId(event));
    return {
      statusCode: 200,
      body: JSON.stringify({ items: todos }),
    };
  }
);
handler.use(
  cors({
    credentials: true,
  })
);