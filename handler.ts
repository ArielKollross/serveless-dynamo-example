import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import * as uuid from 'uuid';
import 'source-map-support/register';

interface IRequest {
  brewName: string;
  breweryName: string;
  style: string;
}

const dynamoDB = new DynamoDB.DocumentClient();

const getErrorResponse = (errorMessage: string) => {
  return {
    statusCode: 500,
    body: JSON.stringify({
      message: errorMessage,
    }),
  }
}

export const saveBrew: APIGatewayProxyHandler = async (event, _context) => {
  const requestBody: IRequest = JSON.parse(event.body);

  const { brewName, breweryName, style } = requestBody;

  console.log(brewName, breweryName, style);

  try {
    const params = {
      TableName: process.env.DYNAMO_TABLE,
      Item: {
        id: uuid.v1(),
        brewName, 
        breweryName, 
        style,
      }
    }

    await dynamoDB.put(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify(params.Item),
    }

  } catch (error) {
    console.error(error);
    return getErrorResponse(error);
  }
}


export const getBrew: APIGatewayProxyHandler = async (event, _context) => {
  const params = {
    TableName: process.env.DYNAMO_TABLE,
  }

  try {
    const data = await dynamoDB.scan(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    }

  } catch (error) {
    console.error(error);
    return getErrorResponse(error);
  }
}