import { TodosAccess } from '../dataLayer/todosAccess'
import { AttachmentUtils } from '../fileStorage/attachmentUtils'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import * as uuid from 'uuid';
import { createLogger } from "../utils/logger";


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
  const s3AttachUrl = attachmentUtils.getAttachmentUrl(userId);
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

export async function UpdateTodo(
  userId: string,
  todoId: string,
  updatedTodo: UpdateTodoRequest
): Promise<TodoItem> {
  logger.info('UpdateTodo');
  const updatesTodo = await todosAccess.updateTodo(userId, todoId, updatedTodo);
  return updatesTodo;
}

export async function deleteTodo(
  todoId: string,
  userId: string
): Promise<String> {
  logger.info('deleteTodo');
  const deleteTodo = await todosAccess.deleteToDo(todoId, userId)
  return deleteTodo;
}

export async function createAttachmentPresignedUrl(
  userId: string,
  todoId: string
): Promise<String> {
  logger.info('createAttachmentPresignedUrl');
  const uploadUrl = todosAccess.getTodoFromDB(todoId, userId);
  return uploadUrl;
}

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
  logger.info('getTodosForUser');
  const getTodo = await todosAccess.getAllTodosForUser(userId);
  return getTodo;
}