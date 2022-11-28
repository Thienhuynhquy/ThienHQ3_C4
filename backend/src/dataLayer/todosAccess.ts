import * as SDK_AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

const AWS = AWSXRay.captureAWS(SDK_AWS)

export class TodosAccess {
    constructor(
        private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
        private readonly Item = process.env.TABLE || '',
        private readonly todoIdIndex = process.env.INDEX_ID || ''
    ) { }

    async getAllItems(userId: string): Promise<TodoItem[]> {
        const results = await this.docClient
            .query({
                TableName: this.Item,
                KeyConditionExpression: 'userId = :userId',
                ExpressionAttributeValues: {
                    ':userId': userId
                }
            })
            .promise()

        return results.Items as TodoItem[]
    }

    async findById(userId: string, todoId: string): Promise<TodoItem | null> {
        const results = await this.docClient
            .query({
                TableName: this.Item,
                IndexName: this.todoIdIndex,
                ConsistentRead: true,
                KeyConditionExpression: 'userId = :userId and todoId = :todoId',
                ExpressionAttributeValues: {
                    ':userId': userId,
                    ':todoId': todoId
                }
            })
            .promise()

        if (results.Count === 0 || !results.Items) {
            return null
        }

        return results.Items[0] as TodoItem
    }

    async createItem(todoItem: TodoItem): Promise<TodoItem> {
        await this.docClient
            .put({
                TableName: this.Item,
                Item: todoItem
            })
            .promise()

        return todoItem
    }

    async updateItem(
        userId: string,
        todoId: string,
        update: TodoUpdate
    ): Promise<boolean> {
        const UpdateItem = await this.findById(userId, todoId)
        if (!UpdateItem) {
            return false
        }

        const createdAt = UpdateItem.createdAt

        await this.docClient
            .update({
                TableName: this.Item,
                Key: { userId, createdAt },
                UpdateExpression:
                    'set #itemName = :itemName, dueDate = :dueDate, done = :done',
                ExpressionAttributeValues: {
                    ':itemName': update.name,
                    ':dueDate': update.dueDate,
                    ':done': update.done
                },
                ExpressionAttributeNames: {
                    '#itemName': 'name'
                }
            })
            .promise()

        return true
    }

    async deleteItem(userId: string, todoId: string): Promise<void> {
        const DeleteItem = await this.findById(userId, todoId)
        if (!DeleteItem) {
            return
        }

        const createdAt = DeleteItem.createdAt
        await this.docClient
            .delete({
                TableName: this.Item,
                Key: { userId, createdAt }
            })
            .promise()
    }
}