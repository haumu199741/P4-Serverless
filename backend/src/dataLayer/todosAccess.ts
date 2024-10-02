import * as AWS from "aws-sdk";
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { createLogger } from '../utils/logger';


const logger = createLogger("TodoAccess");
const s3_bucket_name = process.env.ATTACHMENT_S3_BUCKET;
const sAWS = require("aws-xray-sdk").captureAWS(AWS);
const url_expiration = process.env.SIGNED_URL_EXPIRATION;


export class TodosAccess {

    constructor(
        private readonly docClient = new AWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly todosIndex = process.env.TODOS_CREATED_AT_INDEX,
        private readonly S3 = new sAWS.S3({ signatureVersion: "v4" }),
        private readonly bucket_name = s3_bucket_name
        
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

    async update(userId: string, todoId: string, todoUpdate: TodoUpdate): Promise<TodoItem> {
      logger.info(`Updating todo item ${todoId} in ${this.todosTable}`);
      try {
        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
              userId,
              todoId,
            },
            UpdateExpression:"set #N = :name, #dueDate = :dueDate, #done = :done",
            ExpressionAttributeNames: {"#N": "name","#dueDate": "dueDate","#done": "done"},
            ExpressionAttributeValues: {
              ":name": todoUpdate.name,
              ":dueDate": todoUpdate.dueDate,
              ":done": todoUpdate.done,
            },
            ReturnValues: "UPDATED_NEW",
          })
          .promise();
      } catch (error) {
        logger.error("Error update Todo.", error.response ? error.response.data : error.message);
        throw Error(error);
      }
      return todoUpdate as TodoItem;
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

    async getUploadUrl(todoId: string, userId: string): Promise<string> {
        const uploadUrl = this.S3.getSignedUrl("putObject", {
          Bucket: this.bucket_name,
          Key: todoId,
          Expires: Number(url_expiration),
        });
        await this.docClient
          .update({
            TableName: this.todosTable,
            Key: {
              userId,
              todoId,
            },
            UpdateExpression: "set attachmentUrl = :URL",
            ExpressionAttributeValues: {
              ":URL": uploadUrl.split("?")[0],
            },
            ReturnValues: "UPDATED_NEW",
          })
          .promise();
        return uploadUrl;
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
    