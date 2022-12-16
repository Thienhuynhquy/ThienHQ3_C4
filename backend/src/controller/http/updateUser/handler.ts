import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { updateUsers } from '../../../businessUser/User'
import { UpdateRequestUser } from '../../../requestDTO/UpdateRequestUser'
import { getUserId } from '../../utils'
import { applyCors, middyfy } from '@libs/handler-lambda'
import { createLogger } from '@libs/logger'

const logger = createLogger('updateUsers')

const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const id = event.pathParameters.todoId
    const updatedUser = JSON.parse(JSON.stringify(event.body || '')) as UpdateRequestUser
    const userId = getUserId(event)
    logger.info('Caller event', event)

    if (!id) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid UserId parameter' })
        }
    }

    const updated = await updateUsers(userId, id, updatedUser)
    if (!updated) {
        logger.info('User item does not exist', { userId, id })
        return {
            statusCode: 404,
            body: JSON.stringify({
                error: 'User item does not exist'
            })
        }
    }

    logger.info('User item was updated', { userId, id })

    return {
        statusCode: 200,
        body: ''
    }
}

export const main = applyCors(middyfy(handler))