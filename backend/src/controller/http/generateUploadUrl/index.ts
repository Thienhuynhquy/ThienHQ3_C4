import { handlerPath } from '@libs/handler-resolver';

export const reqFunc = {
    handler: `${handlerPath(__dirname)}/handler.main`,
    events: [
        {
            http: {
                method: 'post',
                path: 'users/{todoId}/attachment',
                cors: true,
                authorizer: 'Auth',
            },
        },
    ],
    iamRoleStatements: [
        {
            Effect: 'Allow',
            Action: [
                's3:PutObject',
            ],
            Resource: 'arn:aws:s3:::${self:provider.environment.ATTACHMENT_S3_BUCKET}/*'
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