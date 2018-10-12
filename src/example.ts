import SQS from './main'

const queue = new SQS({
  queueUrl: 'https://sqs.us-east-1.amazonaws.com/993260122582/test_queue'
})

queue.pull().then(data => {
  console.log('pulled from queue')
  console.log(JSON.stringify(data))
  console.log('deleting requested message')
  queue.delete(data.ReceiptHandle).then(data => {
    console.log('message deleted: ' + data)
  })
})

queue
  .push({
    Body: 'this is the body',
    Attributes: {
      url: 'this is a test url',
      numberOfSeconds: 23
    }
  })
  .then(data => {
    console.log('pushed to queue')
    console.log(data)
  })
