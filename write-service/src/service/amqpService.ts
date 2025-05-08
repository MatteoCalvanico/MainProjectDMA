import * as amqp from "amqplib";
import { mongoRepo } from "../repository/mongoRepo";

export class amqpService {
  mongo: mongoRepo = new mongoRepo();

  private _host: string = process.env.AMQP_HOST || "localhost";
  private _amqpPort: string = process.env.AMQP_PORT || "5672";

  private _user: string = process.env.RABBITMQ_USER || "guest";
  private _psw: string = process.env.RABBITMQ_PASSWORD || "guest";

  private _amqpConnectUrl: string;

  private _conn!: amqp.ChannelModel;
  private _channel!: amqp.Channel;
  private _queue = "projectOneData"; // Queue name
  private _routingKey = "projectOneData"; // MQTT topic name

  constructor() {
    this._amqpConnectUrl = `amqp://${this._user}:${this._psw}@${this._host}:${this._amqpPort}`;
  }

  async connect() {
    console.log("Connection to DB...");
    await this.mongo.connect();
    console.log("Connection to DB completed!!!\n");

    console.log("Connection to broker via AMQP...");
    this._conn = await amqp.connect(this._amqpConnectUrl);
    this._channel = await this._conn.createChannel();
    await this._channel.assertQueue(this._queue, { durable: true });

    // Bind the queue to the amq.topic exchange with the MQTT topic as the routing key
    // Because when using RabbitMQ with both protocols, the MQTT topics are published to the "amq.topic" exchange by default, but AMQP consumer isn't binding to this exchange.
    await this._channel.bindQueue(this._queue, "amq.topic", this._routingKey);
  }

  async save() {
    await this._channel.consume(this._queue, async (msg) => {
      if (!msg) {
        return console.warn("Consumer cancelled by server");
      }
      console.log("Received message on topic:", this._routingKey);
      console.log("Message sender:", msg.content.toString().split("|")[0]);
      console.log("Message content:", msg.content.toString().split("|")[1]);
      await this.mongo.saveSeries({
        topic: this._routingKey,
        payload: msg.content.toString(),
      });
      this._channel.ack(msg);
    });
    console.log(`Started consuming messages from queue: ${this._queue}`);
  }
}
