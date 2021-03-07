const config = require('./config');
const amqp = require('amqplib/callback_api');

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
        //implement job handling
      } catch (err) {}
    });
  });
});
