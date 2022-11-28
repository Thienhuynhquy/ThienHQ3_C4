import schema from './schema';
import { handlerPath } from '@libs/handler-resolver';

export const reqFunc = {
    handler: `${handlerPath(__dirname)}/handler.main`,
    events: [
        {
            http: {
                method: 'patch',
                path: 'todos/{todoId}',
                cors: true,
                authorizer: 'Auth',
                request: {
                    schemas: {
                        "application/json": "${file(schemas/update-todo-request.json)}",
                    },
                },
            },
        },
    ],
    iamRoleStatements: [
        {
            Effect: 'Allow',
            Action: [
                'dynamodb:UpdateItem',
            ],
            Resource: 'arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.TABLE}'
        },
        {
            Effect: 'Allow',
            Action: [
                'dynamodb:Query',
            ],
            Resource: 'arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.TABLE}/index/${self:provider.environment.INDEX_ID}'
        },
    ]
};

export const reqSchema = { ...schema };