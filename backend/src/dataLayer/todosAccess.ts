import * as AWS from "aws-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { createLogger } from "../utils/logger";


const logger = createLogger("TodoAccess");

export class TodosAccess {

    constructor(
        private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly todosIndex = process.env.TODOS_CREATED_AT_INDEX,
    ) {
    }

    async getAllTodosForUser(userId: string): Promise<TodoItem[]> {
        logger.info('getAllTodosForUser');
        const result = await this.docClient
            .query({
                TableName: this.todosTable,
                IndexName: this.todosIndex,
                KeyConditionExpression: 'userId = :userId',
                ExpressionAttributeValues: {
                    ':userId': userId
                }
            })
            .promise()

        return result.Items as TodoItem[];
    }

    async createTodo(todo: TodoItem): Promise<TodoItem> {
        logger.info('createTodo');
        await this.docClient.put({
            TableName: this.todosTable,
            Item: todo
        }).promise()

        return todo as TodoItem;
    }

    async updateTodo(userId: string, todoId: string, updatedTodo: TodoUpdate) {
        logger.info('updateTodo');
        const updatedsTodo = await this.docClient.update({
            TableName: this.todosTable,
            Key: { userId, todoId },
            ExpressionAttributeNames: { "#N": "name"; "#done" },
            UpdateExpression: "set #N=:todoName, dueDate=:dueDate, done=:done",
            ExpressionAttributeValues: {
              ":todoName": updatedTodo.name,
              ":dueDate": updatedTodo.dueDate,
              ":done": updatedTodo.done
          },
          ReturnValues: "UPDATED_NEW"
        })
        .promise();
      return { Updated: updatedsTodo };
    }

    async getTodoFromDB(todoId: string, userId: string) {
        logger.info('getTodoFromDB');
        const result = await this.docClient.get({
            TableName: this.todosTable,
            Key: {
                todoId,
                userId
            }
        }).promise();
  
        return result.Item;
    }

    async deleteToDo(todoId: string, userId: string) {
        logger.info('deleteToDo');
        await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                todoId,
                userId
            }
        }).promise();
    }
}
    