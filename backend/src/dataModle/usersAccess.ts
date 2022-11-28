import * as SDK_AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { UserItem } from '../paramModle/UserItem'
import { UpdateUser } from '../paramModle/UpdateUser'

const AWS = AWSXRay.captureAWS(SDK_AWS)

export class UsersAccess {
    constructor(
        private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
        private readonly Item = process.env.TABLE || '',
        private readonly todoIdIndex = process.env.INDEX_ID || ''
    ) { }

    async getAllItems(userId: string): Promise<UserItem[]> {
        const results = await this.docClient
            .query({
                TableName: this.Item,
                KeyConditionExpression: 'userId = :userId',
                ExpressionAttributeValues: {
                    ':userId': userId
                }
            })
            .promise()

        return results.Items as UserItem[]
    }

    async findById(userId: string, todoId: string): Promise<UserItem | null> {
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

        return results.Items[0] as UserItem
    }

    async createItem(UserItem: UserItem): Promise<UserItem> {
        await this.docClient
            .put({
                TableName: this.Item,
                Item: UserItem
            })
            .promise()

        return UserItem
    }

    async updateItem(
        userId: string,
        todoId: string,
        update: UpdateUser
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
                    'set #itemName = :itemName, timedate = :timedate, done = :done',
                ExpressionAttributeValues: {
                    ':itemName': update.name,
                    ':timedate': update.timedate,
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