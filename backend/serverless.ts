import type { AWS } from '@serverless/typescript';

import * as CreateUsers from '@functions/CreateUser';
import * as deleteUsers from '@functions/deleteUser';
import * as generateUploadUrl from '@functions/generateUploadUrl';
import * as getUser from '@functions/getUser';
import * as updateUsers from '@functions/updateUser';
import * as auth from '@functions/auth0Authorizer';

const serverlessConfiguration: AWS = {
  org: 'thienhq3',
  service: 'serverless-user-app',
  frameworkVersion: '3',
  plugins: [
    'serverless-aws-documentation',
    'serverless-esbuild',
    'serverless-iam-roles-per-function',
  ],
  package: {
    individually: true,
  },
  // provider config
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    stage: "${opt:stage, 'dev'}",
    region: "${opt:region, 'us-east-1'}" as 'us-east-1',
    tracing: {
      lambda: true,
      apiGateway: true,
    },
    // env variables
    environment: {
      TABLE: 'Todos-${self:provider.stage}',
      INDEX_ID: 'TodoIdIndex',
      ATTACHMENT_S3_BUCKET: 'todo-images-user-125653915937-${self:provider.stage}',
      ATTACHMENT_UPLOAD_URL_EXPIRATION: '300',
      ATTACHMENT_DOWNLOAD_URL_EXPIRATION: '300',
      JWKS_URL: 'https://dev-gdfcqcmab63tzby1.us.auth0.com/.well-known/jwks.json',
    },
    // IAM role
    iamRoleStatements: [
    ],
  },
  // import the function via paths
  functions: {
    CreateUser: CreateUsers.reqFunc,
    DeleteUser: deleteUsers.reqFunc,
    GenerateUploadUrl: generateUploadUrl.reqFunc,
    GetUser: getUser.reqFunc,
    UpdateTodo: updateUsers.reqFunc,
    Auth: auth.eventHandler,
  },
  // resources config
  resources: {
    Resources: {
      GatewayResponseDefault4XX: {
        Type: 'AWS::ApiGateway::GatewayResponse',
        Properties: {
          ResponseParameters: {
            'gatewayresponse.header.Access-Control-Allow-Origin': "'*'",
            'gatewayresponse.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
            'gatewayresponse.header.Access-Control-Allow-Methods': "'GET,OPTIONS,POST,PATCH,DELETE'"
          },
          ResponseType: 'DEFAULT_4XX',
          RestApiId: {
            Ref: 'ApiGatewayRestApi'
          }
        }
      },
      RequestBodyValidator: {
        Type: 'AWS::ApiGateway::RequestValidator',
        Properties: {
          Name: 'request-body-validator',
          RestApiId: {
            Ref: 'ApiGatewayRestApi'
          },
          ValidateRequestBody: true,
          ValidateRequestParameters: false
        }
      },
      TodosTable: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          AttributeDefinitions: [
            {
              AttributeName: 'userId',
              AttributeType: 'S'
            },
            {
              AttributeName: 'createdAt',
              AttributeType: 'S'
            },
            {
              AttributeName: 'todoId',
              AttributeType: 'S'
            },
          ],
          KeySchema: [
            {
              AttributeName: 'userId',
              KeyType: 'HASH'
            },
            {
              AttributeName: 'createdAt',
              KeyType: 'RANGE'
            },
          ],
          LocalSecondaryIndexes: [
            {
              IndexName: '${self:provider.environment.INDEX_ID}',
              KeySchema: [
                {
                  AttributeName: 'userId',
                  KeyType: 'HASH'
                },
                {
                  AttributeName: 'todoId',
                  KeyType: 'RANGE'
                },
              ],
              Projection: {
                ProjectionType: 'ALL',
              },
            },
          ],
          BillingMode: 'PAY_PER_REQUEST',
          TableName: '${self:provider.environment.TABLE}',
        }
      },
      AttachmentsBucket: {
        Type: 'AWS::S3::Bucket',
        Properties: {
          BucketName: '${self:provider.environment.ATTACHMENT_S3_BUCKET}',
          CorsConfiguration: {
            CorsRules: [
              {
                AllowedOrigins: ['*'],
                AllowedHeaders: ['*'],
                AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
                MaxAge: 3000
              }
            ]
          }
        }
      },
    }
  },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
    documentation: {
      api: {
        info: {
          version: 'v1.0.0',
          title: 'Todo App API',
          description: 'Serverless application for todos'
        }
      },
      models: [
        {
          name: 'CreateRequestUser',
          contentType: 'application/json',
          schema: CreateUsers.reqSchema,
        },
        {
          name: 'UpdateRequestUser',
          contentType: 'application/json',
          schema: updateUsers.reqSchema,
        }
      ]
    }
  },
};

module.exports = serverlessConfiguration;