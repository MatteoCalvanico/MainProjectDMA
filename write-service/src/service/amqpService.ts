import * as amqp from "amqplib";
import { mongoRepo } from "../repository/mongoRepo";

export class amqpService {
  mongo: mongoRepo = new mongoRepo();

  private host: string = process.env.AMQP_HOST || "localhost";
  private amqpPort: string = process.env.AMQP_PORT || "5672";

  private user: string = process.env.RABBITMQ_USER || "guest";
  private psw: string = process.env.RABBITMQ_PASSWORD || "guest";

  private amqpConnectUrl: string;
  private clientId: string;

  private conn!: amqp.ChannelModel;
  private channel!: amqp.Channel;
  private queue = "projectOneData"; // Queue name
  private routingKey = "projectOneData"; // MQTT topic name

  constructor() {
    this.amqpConnectUrl = `amqp://${this.user}:${this.psw}@${this.host}:${this.amqpPort}`;
    this.clientId = `amqp_${Math.random().toString(16).slice(3)}`;
  }

  async connect() {
    console.log("Connection to DB...");
    await this.mongo.connect();
    console.log("Connection to DB completed!!!\n");

    console.log("Connection to broker via AMQP...");
    this.conn = await amqp.connect(this.amqpConnectUrl);
    this.channel = await this.conn.createChannel();
    await this.channel.assertQueue(this.queue, { durable: true });

    // Bind the queue to the amq.topic exchange with the MQTT topic as the routing key
    // Because when using RabbitMQ with both protocols, the MQTT topics are published to the "amq.topic" exchange by default, but AMQP consumer isn't binding to this exchange.
    await this.channel.bindQueue(this.queue, "amq.topic", this.routingKey);
  }

  save() {
    this.channel.consume(this.queue, async (msg) => {
      if (msg !== null) {
        console.log("Received message on topic:", this.routingKey);
        console.log("Message sender:", msg.content.toString().split("|")[0]);
        console.log("Message content:", msg.content.toString().split("|")[1]);
        await this.mongo.saveSeries({
          topic: this.routingKey,
          payload: msg.content.toString(),
        });
        this.channel.ack(msg);
      } else {
        console.warn("Consumer cancelled by server");
      }
    });
    console.log(`Started consuming messages from queue: ${this.queue}`);
  }
}
