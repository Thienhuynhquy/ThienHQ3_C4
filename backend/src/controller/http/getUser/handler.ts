import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { UserItem } from '../../../paramModle/UserItem'
import { getUser as getUser } from '../../../businessUser/user'
import { getUserId } from '../../utils';
import { applyCors, middyfy } from '@libs/handler-lambda'
import { createLogger } from '@libs/logger'

const logger = createLogger('getTodo')

const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Caller event', event)

    const userId = getUserId(event)
    const user: UserItem[] = await getUser(userId)

    logger.info('User items fetched', { userId, count: user.length })

    return {
        statusCode: 200,
        body: JSON.stringify({ items: user })
    }
}

export const main = applyCors(middyfy(handler))