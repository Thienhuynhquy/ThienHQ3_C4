import type { AWS } from '@serverless/typescript';

import * as createTodo from '@functions/createTodo';
import * as deleteTodo from '@functions/deleteTodo';
import * as generateUploadUrl from '@functions/generateUploadUrl';
import * as getTodo from '@functions/getTodo';
import * as updateTodo from '@functions/updateTodo';
import * as auth from '@functions/auth0Authorizer';

const serverlessConfiguration: AWS = {
  org: 'fsoft',
  service: 'serverless-todo-app',
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
      TODOS_TABLE: 'Todos-${self:provider.stage}',
      TODOS_ID_INDEX: 'TodoIdIndex',
      ATTACHMENT_S3_BUCKET: 'todo-images-276364682433-${self:provider.stage}',
      ATTACHMENT_UPLOAD_URL_EXPIRATION: '300',
      ATTACHMENT_DOWNLOAD_URL_EXPIRATION: '300',
      JWKS_URL: 'https://thinhtpt-dev.us.auth0.com/.well-known/jwks.json',
    },
    // IAM role
    iamRoleStatements: [
    ],
  },
  // import the function via paths
  functions: {
    CreateTodo: createTodo.reqFunc,
    DeleteTodo: deleteTodo.reqFunc,
    GenerateUploadUrl: generateUploadUrl.reqFunc,
    GetTodo: getTodo.reqFunc,
    UpdateTodo: updateTodo.reqFunc,
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
              IndexName: '${self:provider.environment.TODOS_ID_INDEX}',
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
          TableName: '${self:provider.environment.TODOS_TABLE}',
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
          name: 'CreateTodoRequest',
          contentType: 'application/json',
          schema: createTodo.reqSchema,
        },
        {
          name: 'UpdateTodoRequest',
          contentType: 'application/json',
          schema: updateTodo.reqSchema,
        }
      ]
    }
  },
};

module.exports = serverlessConfiguration;