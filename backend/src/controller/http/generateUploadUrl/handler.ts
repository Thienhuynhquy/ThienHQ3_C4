import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { getAttachmentUploadUrl } from '../../../businessUser/User'
import { getUserId } from '../../utils'
import { applyCors, middyfy } from '@libs/handler-lambda'
import { createLogger } from '@libs/logger'

const logger = createLogger('generateUploadUrl')

const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Caller event', event)

    const userId = getUserId(event)
    const todoId = event.pathParameters?.todoId

    if (!todoId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid UserId parameter' })
        }
    }

    const uploadUrl = await getAttachmentUploadUrl(userId, todoId)
    if (!uploadUrl) {
        logger.info('User item does not exist', { userId, todoId })
        return {
            statusCode: 404,
            body: JSON.stringify({
                error: 'User item does not exist'
            })
        }
    }

    logger.info('Attachment upload url generated', { userId, todoId, uploadUrl })

    return {
        statusCode: 200,
        body: JSON.stringify({ uploadUrl })
    }
}

export const main = applyCors(middyfy(handler))