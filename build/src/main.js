"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const AWS = require("aws-sdk");
class SQS {
    constructor({ region = 'us-east-1', queueUrl, apiVersion = 'latest' }) {
        this.parseAWSAttributes = (attributes) => {
            let res = {};
            for (let property in attributes) {
                if (attributes.hasOwnProperty(property)) {
                    res[property] =
                        attributes[property].DataType === 'Number'
                            ? parseInt(attributes[property].StringValue)
                            : attributes[property].StringValue;
                }
            }
            return res;
        };
        this.parseRequestAttributes = (attributes) => {
            let res = {};
            for (let property in attributes) {
                if (attributes.hasOwnProperty(property)) {
                    res[property] = {
                        StringValue: attributes[property].toString(),
                        DataType: isNaN(attributes[property]) ? 'String' : 'Number'
                    };
                }
            }
            return res;
        };
        this.parseResponse = (message) => {
            return {
                MessageId: message.MessageId,
                ReceiptHandle: message.ReceiptHandle,
                Body: message.Body,
                Attributes: this.parseAWSAttributes(message.MessageAttributes)
            };
        };
        this.push = ({ Body, Attributes }) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const message = yield this.sqs
                .sendMessage({
                QueueUrl: this.queueUrl,
                MessageBody: Body,
                MessageAttributes: this.parseRequestAttributes(Attributes)
            })
                .promise();
            if (message) {
                return message.MessageId;
            }
            return undefined;
        });
        this.pull = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const message = yield this.sqs
                .receiveMessage({
                QueueUrl: this.queueUrl,
                AttributeNames: ['All'],
                MessageAttributeNames: ['All'],
                MaxNumberOfMessages: 1
            })
                .promise();
            if (message && message.Messages && message.Messages.length > 0) {
                return this.parseResponse(message.Messages[0]);
            }
            return undefined;
        });
        this.delete = (ReceiptHandle) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const deleted = yield this.sqs
                .deleteMessage({
                QueueUrl: this.queueUrl,
                ReceiptHandle
            })
                .promise();
            if (deleted) {
                return true;
            }
            return false;
        });
        this.sqs = new AWS.SQS({
            region,
            apiVersion
        });
        this.queueUrl = queueUrl;
    }
}
exports.default = SQS;
//# sourceMappingURL=main.js.map