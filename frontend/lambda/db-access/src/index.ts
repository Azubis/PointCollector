import {Logger} from '@aws-lambda-powertools/logger'
import {Context} from 'aws-lambda';
import {SecretsManager} from '@aws-sdk/client-secrets-manager';
import {Connection} from 'postgresql-client';
import {logData, serviceName} from './logging-util';
import {NoraLogFormatter} from './NoraLogFormatter';
import {readFileSync} from 'fs';

interface DatabaseSecretValue {
    username: string
    password: string
    host: string
    port: number
    engine: string
    dbname: string
    masterarn: string
}

interface InputEvent {
    queries: string[]
}


const resolveSecret = async (secretsManager: SecretsManager, secretId: string) => {
    const secretValue = await secretsManager.getSecretValue({
        SecretId: secretId
    })
    if (secretValue.SecretString === undefined) {
        throw new Error(`No secret string for ${secretId}`)
    }
    const secret: DatabaseSecretValue = JSON.parse(secretValue.SecretString)
    return secret
};

const getConnection = (secret: DatabaseSecretValue): Connection => new Connection({
    host: secret.host,
    port: secret.port,
    user: secret.username,
    password: secret.password,
    database: secret.dbname,
    ssl: {
        rejectUnauthorized: false,
        ca: readFileSync('./eu-west-1-bundle.cert').toString() // cert from https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/UsingWithRDS.SSL.html
    }
});

const logger = new Logger({serviceName: serviceName('db-setup'), logFormatter: new NoraLogFormatter()})

export const handler = async (event: InputEvent, context: Context) => {
    logger.info('EVENT: \n' + JSON.stringify(event, null, 2));
    logger.addContext(context)
    if (
        process.env.REGION === undefined ||
        process.env.DB_SCHEMA_NAME === undefined ||
        process.env.DB_USER_SECRET_ARN == undefined
    ) {
        throw new Error(
            'Missing environment variable (either REGION, DB_SECRET_ARN or DB_SCHEMA_NAME or DB_USER_SECRET_ARN'
        )
    }

    try {
        const REGION = process.env.REGION
        //const SCHEMA = process.env.DB_SCHEMA_NAME
        const secretsManager = new SecretsManager({region: REGION})

        const dbUserSecret: DatabaseSecretValue = await resolveSecret(secretsManager, process.env.DB_USER_SECRET_ARN)

        logger.info('Opening connection...')
        const connection = getConnection(dbUserSecret)
        await connection.connect()

        const queries = event.queries
        for (const query of queries) {
            if (query.startsWith('#')) {
                console.log('Skipping query: ' + query)
                continue
            }
            console.log('Executing query: ' + query)
            const result = await connection.query(query)
            console.log(JSON.stringify(result, null, 2))
        }

        await connection.close()
    } catch (error) {
        logger.error('error', logData(error))
        throw error
    }


    return {
        PhysicalResourceId: 'DBAccess',
        Data: {
            Response: 'Successfully executed statements'
        }
    }
}

