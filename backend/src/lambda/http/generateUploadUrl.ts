import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors, httpErrorHandler } from 'middy/middlewares';
import { getUserId } from '../utils';
import { createAttachmentPresignedUrl  } from '../../businessLogic/todos';


export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId;
    const userId = getUserId(event);
    const url = await createAttachmentPresignedUrl(userId, todoId);
    return {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      statusCode: 201,
      body: JSON.stringify({ uploadUrl: url }),
    };
  }
);

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true,
  })
);