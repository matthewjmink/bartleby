// Import required AWS SDK clients and commands for Node.js
const {
    DynamoDB,
} = require('@aws-sdk/client-dynamodb');
const { unmarshall } = require("@aws-sdk/util-dynamodb");

// TODO: Get these from env vars
const { AWS_REGION, AWS_IAM_ACCESS_KEY, AWS_IAM_SECRET } = process.env;

// Create DynamoDB service object
const dbclient = new DynamoDB({
    region: AWS_REGION,
    credentials: {
        accessKeyId: AWS_IAM_ACCESS_KEY,
        secretAccessKey: AWS_IAM_SECRET,
    }
});
const snippetsTableName = 'Snippets';
let setup;

const createSnippetsTable = async () => {
    console.log('Creating snippets table...')
    try {
        const data = await dbclient.createTable({
            TableName: snippetsTableName,
            AttributeDefinitions: [
                {
                    AttributeName: 'contentKey',
                    AttributeType: 'S',
                },
            ],
            KeySchema: [
                {
                    AttributeName: 'contentKey',
                    KeyType: 'HASH',
                },
            ],
            ProvisionedThroughput: {
                ReadCapacityUnits: 5,
                WriteCapacityUnits: 5
            },
        });
        console.log('Successfully created Snippets table', data);
    } catch (err) {
        console.log('Error creating snippets table', err);
        throw new Error();
    }
};

const ensureSnippetsTableExists = async () => {
    try {
        await dbclient.describeTable({ TableName: snippetsTableName });
        return true;
    } catch (err) {
        if (err.name === 'ResourceNotFoundException') {
            try {
                await createSnippetsTable();
                return true;
            } catch (error) {
                // Error creating table
            }
        } else {
            // Error connecting to AWS DynamoDB Client
            console.log('Error', err);
        }
        return false;
    }
};

setup = (async () => await ensureSnippetsTableExists())();

const getSnippets = async (snippetKeys = new Set()) => {
    if (snippetKeys.size === 0 || !(await setup)) return;

    try {
        const data = await dbclient.batchGetItem({
            RequestItems: {
                [snippetsTableName]: {
                    Keys: Array.from(snippetKeys).map(snippetKey => ({ contentKey: { S: snippetKey } })),
                },
            },
        });
        return data.Responses[snippetsTableName].map(snippet => unmarshall(snippet));
    } catch (err) {
        console.log('Error', err);
    }
};

module.exports = {
    getSnippets,
};
