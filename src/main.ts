import * as AWS from 'aws-sdk'

class SQS {
  private sqs: AWS.SQS
  private queueUrl: string
  /**
   * @constructs SQS
   * @param region aws region
   * @param endpoint vpn server authentication username
   */

  constructor({
    region = 'us-east-1',
    queueUrl,
    apiVersion = 'latest'
  }: {
    region?: string
    queueUrl: string
    apiVersion?: string
  }) {
    this.sqs = new AWS.SQS({
      region,
      apiVersion
    })
    this.queueUrl = queueUrl
  }

  private parseAWSAttributes = (attributes: any) => {
    let res = {}
    for (let property in attributes) {
      if (attributes.hasOwnProperty(property)) {
        res[property] =
          attributes[property].DataType === 'Number'
            ? parseInt(attributes[property].StringValue)
            : attributes[property].StringValue
      }
    }
    return res
  }

  private parseRequestAttributes = (attributes: any) => {
    let res = {}
    for (let property in attributes) {
      if (attributes.hasOwnProperty(property)) {
        res[property] = {
          StringValue: attributes[property].toString(),
          DataType: isNaN(attributes[property]) ? 'String' : 'Number'
        }
      }
    }
    return res
  }

  private parseResponse = (message: AWS.SQS.Message) => {
    return {
      MessageId: message.MessageId,
      ReceiptHandle: message.ReceiptHandle,
      Body: message.Body,
      Attributes: this.parseAWSAttributes(message.MessageAttributes)
    }
  }

  public push = async ({ Body, Attributes }) => {
    const message = await this.sqs
      .sendMessage({
        QueueUrl: this.queueUrl,
        MessageBody: Body,
        MessageAttributes: this.parseRequestAttributes(Attributes)
      })
      .promise()
    if (message) {
      return message.MessageId
    }
    return undefined
  }

  public pull = async () => {
    const message = await this.sqs
      .receiveMessage({
        QueueUrl: this.queueUrl,
        AttributeNames: ['All'],
        MessageAttributeNames: ['All'],
        MaxNumberOfMessages: 1
      })
      .promise()
    if (message && message.Messages && message.Messages.length > 0) {
      return this.parseResponse(message.Messages[0])
    }
    return undefined
  }

  public delete = async (ReceiptHandle: string) => {
    const deleted = await this.sqs
      .deleteMessage({
        QueueUrl: this.queueUrl,
        ReceiptHandle
      })
      .promise()
    if (deleted) {
      return true
    }
    return false
  }
}

export default SQS
