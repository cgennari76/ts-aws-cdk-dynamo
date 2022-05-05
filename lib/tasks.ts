import { DynamoDB } from 'aws-sdk';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { env } from 'process';
import { v4 } from 'uuid';
import { promises } from 'dns';

const dynamoClient = new DynamoDB.DocumentClient();

export async function post(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
    console.log(event);

    if (!event.body) {
        return {
            statusCode: 400,
        };
    }

    const task = JSON.parse(event.body);
    const id = v4();

    const put = await dynamoClient.put({
        TableName: env.TABLE_NAME!,
        Item: {
            PK: id,
            Name: task.name,
            State: task.state,
        },
    }).promise();

    return {
        statusCode: 200,
        body: JSON.stringify({...task, id}),
    };
}

export async function get(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
    console.log(event);

    const tasks = (await getTasksFromDatabase()).map((task) => ({
        id: task.PK,
        name: task.Name,
        state: task.State,
    }));

    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(tasks),
    };
}

async function getTasksFromDatabase(): Promise<DynamoDB.DocumentClient.ItemList> {
    let startKey;
    const result: DynamoDB.DocumentClient.ItemList = [];

    do {
        const res: DynamoDB.DocumentClient.ScanOutput = await dynamoClient.scan({
            TableName: env.TABLE_NAME!,
            ExclusiveStartKey: startKey,
        }).promise();

        if (res.Items) {
            result.push()
        }
    } while (startKey);

    return result;
}
