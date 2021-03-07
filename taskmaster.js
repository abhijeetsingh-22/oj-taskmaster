const config = require('./config');
const amqp = require('amqplib/callback_api');
const RunJob = require('./tasks/jobs/run');
const execute = require('./tasks');

const jobQ = config.JOB_QUEUE;
const successQ = config.SUCCESS_QUEUE;
const errorQ = config.ERROR_QUEUE;
const rabbitURI = `amqp://${config.AMQP.USER}:${config.AMQP.PASS}@${config.AMQP.HOST}:${config.AMQP.PORT}`;
amqp.connect(rabbitURI, (err, connection) => {
  if (err) throw err;
  console.log('connected to rabbit server');
  connection.createChannel((err, channel) => {
    if (err) throw err;
    channel.assertQueue(jobQ, {durable: true});
    channel.assertQueue(successQ, {durable: true});
    channel.assertQueue(errorQ, {durable: true});
    channel.consume(jobQ, async (msg) => {
      try {
        const payload = JSON.parse(msg.content.toString());
        console.log('message received working on it');
        //implement job handling
        let job;
        switch (payload.scenario) {
          case 'run':
            job = new RunJob(payload);
            break;
          default:
            throw new Error('Scenario not declared');
        }
        const jobResult = await execute(job);
        channel.sendToQueue(successQ, Buffer.from(JSON.stringify(jobResult)));
      } catch (err) {
        console.log('error occured', err);
      }
      channel.ack(msg);
    });
  });
});
