import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { deleteUsers } from '../../../businessUser/User'
import { getUserId } from '../../utils'
import { applyCors, middyfy } from '@libs/handler-lambda'
import { createLogger } from '@libs/logger'

const logger = createLogger('deleteUsers')

const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Caller event', event)

    const userId = getUserId(event)
    const todoId = event.pathParameters?.todoId
    if (!todoId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid todoId parameter' })
        }
    }

    await deleteUsers(userId, todoId)

    logger.info('Todo item was deleted', { userId, todoId })

    return {
        statusCode: 200,
        body: ''
    }
}

export const main = applyCors(middyfy(handler))