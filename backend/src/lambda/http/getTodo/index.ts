import { handlerPath } from '@libs/handler-resolver';

export const reqFunc = {
    handler: `${handlerPath(__dirname)}/handler.main`,
    events: [
        {
            http: {
                method: 'get',
                path: 'todos',
                cors: true,
                authorizer: 'Auth',
            },
        },
    ],
    iamRoleStatements: [
        {
            Effect: 'Allow',
            Action: [
                's3:HeadObject',
                's3:GetObject',
            ],
            Resource: 'arn:aws:s3:::${self:provider.environment.ATTACHMENT_S3_BUCKET}/*'
        },
        {
            Effect: 'Allow',
            Action: [
                'dynamodb:Query',
            ],
            Resource: 'arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.TODOS_TABLE}'
        },
    ]
};