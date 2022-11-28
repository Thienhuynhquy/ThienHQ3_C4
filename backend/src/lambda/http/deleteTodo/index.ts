import { handlerPath } from '@libs/handler-resolver';

export const reqFunc = {
    handler: `${handlerPath(__dirname)}/handler.main`,
    events: [
        {
            http: {
                method: 'delete',
                path: 'todos/{todoId}',
                cors: true,
                authorizer: 'Auth',
            },
        },
    ],
    iamRoleStatements: [
        {
            Effect: 'Allow',
            Action: [
                'dynamodb:DeleteItem',
            ],
            Resource: 'arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.TODOS_TABLE}'
        },
        {
            Effect: 'Allow',
            Action: [
                'dynamodb:Query',
            ],
            Resource: 'arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.TODOS_TABLE}/index/${self:provider.environment.TODOS_ID_INDEX}'
        },
    ]
};