import type { Serverless } from 'serverless/aws';


const SERVICE_NAME = 'brew-book-api';
const DYNAMO_TABLE = `${SERVICE_NAME}-dev`;

const serverlessConfiguration: Serverless = {
  service: {
    name: SERVICE_NAME,
    // app and org for use with dashboard.serverless.com
    // app: your-app-name,
    // org: your-org-name,
  },
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true
    }
  },
  // Add the serverless-webpack plugin
  plugins: ['serverless-webpack'],
  provider: {
    name: 'aws',
    stage: 'dev',
    region: 'us-east-1',
    runtime: 'nodejs12.x',
    apiGateway: {
      minimumCompressionSize: 1024,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      DYNAMO_TABLE,
    },
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: [
          'dynamodb:Query',
          'dynamodb:Scan',
          'dynamodb:GetItem',
          'dynamodb:PutItem',
          'dynamodb:UpdateItem',
          'dynamodb:DeleteItem',
        ],
        Resource: '*',
      }
    ]
  },
  functions: {
    saveBrew: {
      handler: 'handler.saveBrew',
      events: [
        {
          http: {
            method: 'post',
            path: 'save',
            cors: true,
          }
        }
      ]
    },
    getBrew: {
      handler: 'handler.getBrew',
      events: [
        {
          http: {
            method: 'get',
            path: 'get',
            cors: true,
          }
        }
      ]
    },
  },
  resources: {
    Resources: {
      BrewsDynamoTable: {
        Type: 'AWS::DynamoDB::Table',
        DeletionPolicy: 'Retain',
        Properties: {
          AttributeDefinitions: [
            {
              AttributeName: 'id',
              AttributeType: 'S'   
            }
          ],
          KeySchema: [
            {
              AttributeName: 'id',
              KeyType: 'HASH'
            }
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1
          },
          TableName:DYNAMO_TABLE
        }
      }
    }
  }
}

module.exports = serverlessConfiguration;
