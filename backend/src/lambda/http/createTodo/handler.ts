import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { CreateTodoRequest } from '../../../requests/CreateTodoRequest'
import { getUserId } from '../../utils';
import { CreateUsers } from '../../../businessLogic/todos'
import { applyCors, middyfy } from '@libs/handler-lambda'
import { createLogger } from '@libs/logger'

const logger = createLogger('CreateUsers')

const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Caller event', event)

    const userId = getUserId(event)
    const newTodo = JSON.parse(JSON.stringify(event.body || '')) as CreateTodoRequest
    const item = await CreateUsers(userId, newTodo)

    logger.info('Todo item was created', { userId, todoId: item.todoId })

    return {
        statusCode: 201,
        body: JSON.stringify({ item })
    }
}

export const main = applyCors(middyfy(handler))