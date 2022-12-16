import schema from './schema';
import { handlerPath } from '@libs/handler-resolver';

export const reqFunc = {
    handler: `${handlerPath(__dirname)}/handler.main`,
    events: [
        {
            http: {
                method: 'post',
                path: 'users',
                cors: true,
                authorizer: 'Auth',
                request: {
                    schemas: {
                        "application/json": "${file(schemas/createUser.json)}",
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