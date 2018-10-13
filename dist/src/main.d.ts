declare class SQS {
    private sqs;
    private queueUrl;
    constructor({ region, queueUrl, apiVersion }: {
        region?: string;
        queueUrl: string;
        apiVersion?: string;
    });
    private parseAWSAttributes;
    private parseRequestAttributes;
    private parseResponse;
    push: ({ Body, Attributes }: {
        Body: any;
        Attributes: any;
    }) => Promise<string>;
    pull: () => Promise<{
        MessageId: string;
        ReceiptHandle: string;
        Body: string;
        Attributes: {};
    }>;
    delete: (ReceiptHandle: string) => Promise<boolean>;
}
export default SQS;
