import { TodosAccess } from '../dataLayer/todosAccess';
import { TodosStorage  } from '../fileStorage/attachmentUtils';
import { TodoItem } from '../models/TodoItem';
import { CreateTodoRequest } from '../requests/CreateTodoRequest';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';
import * as uuid from 'uuid';
import { createLogger } from "../utils/logger";
import { APIGatewayProxyEvent } from 'aws-lambda';
import { getUserId } from '../lambda/utils';



const todosAccess = new TodosAccess();
const logger = createLogger("TodosAccess");
const attachmentUtils = new TodosStorage ();
const bucketName = process.env.ATTACHMENT_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

export async function createTodo(
  newItem: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {
  logger.info('createTodo');
  const todoId = uuid.v4();
  const createdAt = new Date(Date.now()).toISOString();
  const todoItem = {
      todoId,
      userId,
      attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${todoId}`,
      createdAt,
      done: false,
      
      ...newItem
  };
  await todosAccess.createTodo(todoItem);
  return todoItem;
}

export async function updateTodo(event: APIGatewayProxyEvent) {
  logger.info('UpdateTodo');
  const todoId = event.pathParameters.todoId
  const userId = getUserId(event)
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
  return await todosAccess.updateTodo(userId, todoId, updatedTodo)

}

export async function deleteToDo(event: APIGatewayProxyEvent) {
  logger.info('deleteToDo');
  const todoId = event.pathParameters.todoId;
  const userId = getUserId(event);
  const check = await todosAccess.getTodoFromDB(todoId, userId);
  if (!check) {
      return false;
  }
  await todosAccess.deleteToDo(todoId, userId);
  return true;
}

export async function generateUploadUrl(event: APIGatewayProxyEvent) {
  const todoId = event.pathParameters.todoId
  const createSignedUrlRequest = {
      Bucket: bucketName,
      Key: todoId,
      Expires: parseInt(urlExpiration)
  }

  return attachmentUtils.getPresignedUploadURL(createSignedUrlRequest);
}


export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
  logger.info('getTodosForUser');
  const getTodo = await todosAccess.getAllTodosForUser(userId);
  return getTodo;
}