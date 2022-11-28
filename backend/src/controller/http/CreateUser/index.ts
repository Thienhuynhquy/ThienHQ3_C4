import schema from './schema';
import { handlerPath } from '@libs/handler-resolver';

export const reqFunc = {
    handler: `${handlerPath(__dirname)}/handler.main`,
    events: [
        {
            http: {
                method: 'post',
                path: 'todos',
                cors: true,
                authorizer: 'Auth',
                request: {
                    schemas: {
                        "application/json": "${file(schemas/create-todo-request.json)}",
                    },
                },
            },
        },
    ],
    iamRoleStatements: [
        {
            Effect: 'Allow',
            Action: [
                'dynamodb:PutItem',
            ],
            Resource: 'arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.TABLE}'
        },
    ]
};

export const reqSchema = { ...schema };