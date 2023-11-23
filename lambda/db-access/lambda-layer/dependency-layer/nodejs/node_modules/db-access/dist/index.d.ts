import { Context } from 'aws-lambda';
interface InputEvent {
    queries: string[];
}
export declare const handler: (event: InputEvent, context: Context) => Promise<{
    PhysicalResourceId: string;
    Data: {
        Response: string;
    };
}>;
export {};
