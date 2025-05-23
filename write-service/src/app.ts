import { amqpService } from "./service/amqpService";

const amqpServ = new amqpService();

(async () => {
  try {
    await amqpServ.connect();
    console.log("Connection established !!!\n");
    await amqpServ.save();
  } catch (error: any) {
    console.error("Error: ", error);
  }
})();
