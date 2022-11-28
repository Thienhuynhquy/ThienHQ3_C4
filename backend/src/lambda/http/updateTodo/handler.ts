import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { updateUsers } from '../../../businessLogic/todos'
import { UpdateTodoRequest } from '../../../requests/UpdateTodoRequest'
import { getUserId } from '../../utils'
import { applyCors, middyfy } from '@libs/handler-lambda'
import { createLogger } from '@libs/logger'

const logger = createLogger('updateUsers')

const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const updatedTodo = JSON.parse(JSON.stringify(event.body || '')) as UpdateTodoRequest
    const userId = getUserId(event)
    logger.info('Caller event', event)

    if (!todoId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid todoId parameter' })
        }
    }

    const updated = await updateUsers(userId, todoId, updatedTodo)
    if (!updated) {
        logger.info('Todo item does not exist', { userId, todoId })
        return {
            statusCode: 404,
            body: JSON.stringify({
                error: 'Todo item does not exist'
            })
        }
    }

    logger.info('Todo item was updated', { userId, todoId })

    return {
        statusCode: 200,
        body: ''
    }
}

export const main = applyCors(middyfy(handler))