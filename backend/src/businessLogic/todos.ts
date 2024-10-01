import { TodosAccess } from '../dataLayer/todosAccess';
import { AttachmentUtils } from '../fileStorage/attachmentUtils';
import { TodoItem } from '../models/TodoItem';
import { CreateTodoRequest } from '../requests/CreateTodoRequest';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';
import * as uuid from 'uuid';
import { createLogger } from "../utils/logger";
import { APIGatewayProxyEvent } from 'aws-lambda';
import { getUserId } from '../lambda/utils';



const todosAccess = new TodosAccess();
const logger = createLogger("TodosAccess");
const attachmentUtils = new AttachmentUtils();

export async function createTodo(
  newItem: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {
  logger.info('createTodo');
  const todoId = uuid.v4();
  const createdAt = new Date(Date.now()).toISOString();
  const s3AttachUrl = attachmentUtils.createAttachmentPresignedUrl(userId);
  const todoItem = {
      todoId,
      userId,
      attachmentUrl: s3AttachUrl,
      createdAt,
      done: false,
      
      ...newItem
  };
  await todosAccess.createTodo(todoItem);
  return todoItem;
}

export async function UpdateTodo(event: APIGatewayProxyEvent) {
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

export async function createAttachmentPresignedUrl(
  userId: string,
  todoId: string
): Promise<String> {
  logger.info("Call function createAttachmentPresignedUrl todos by" + userId);
  const uploadUrl = todosAccess.getUploadUrl(todoId, userId);
  return uploadUrl;
}

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
  logger.info('getTodosForUser');
  const getTodo = await todosAccess.getAllTodosForUser(userId);
  return getTodo;
}