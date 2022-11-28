import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { TodoItem } from '../../../models/TodoItem'
import { getTodosForUser as getTodosForUser } from '../../../businessLogic/todos'
import { getUserId } from '../../utils';
import { applyCors, middyfy } from '@libs/handler-lambda'
import { createLogger } from '@libs/logger'

const logger = createLogger('getTodo')

const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Caller event', event)

    const userId = getUserId(event)
    const todos: TodoItem[] = await getTodosForUser(userId)

    logger.info('Todo items fetched', { userId, count: todos.length })

    return {
        statusCode: 200,
        body: JSON.stringify({ items: todos })
    }
}

export const main = applyCors(middyfy(handler))