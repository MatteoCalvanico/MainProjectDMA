import { useState } from "react";
import mqtt, { MqttClient } from "mqtt";

// Variabile globale per il client MQTT
let client: MqttClient | null = null;

function MqttClientPage() {
  const [message, setMessage] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("Disconnesso");
  const [messageStatus, setMessageStatus] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  function connect() {
    // Evita connessioni multiple
    if (client && client.connected) {
      console.log("Già connesso");
      return;
    }

    // Get the access token
    const accessToken = localStorage.getItem('authToken');
    if (!accessToken) {
      console.error("Access token is missing. Please login first.");
      setConnectionStatus("Errore: Token di accesso mancante");
      return;
    }

    // Configurazione per il broker RabbitMQ locale
    const host = import.meta.env.REACT_APP_MQTT_HOST || "localhost";
    const port = import.meta.env.REACT_APP_MQTT_PORT || "8000";
    const path = import.meta.env.REACT_APP_MQTT_PATH || "/mqtt-ws";
    const clientId = `mqtt_${Math.random().toString(16).slice(3)}`;

    const connectUrl = `ws://${host}:${port}${path}?jwt=${accessToken}`; // Passiamo il token direttamente via query perchè Mqtt.js non supporta il passaggio di dati via header

    setConnectionStatus("Connessione in corso...");

    client = mqtt.connect(connectUrl, {
      clientId,
      clean: true,
      connectTimeout: 4000,
      username: import.meta.env.REACT_APP_RABBITMQ_USER || "guest",
      password: import.meta.env.REACT_APP_RABBITMQ_PASSWORD || "guest",
      reconnectPeriod: 1000,
    });

    client.on("connect", () => {
      console.log("Connected");
      setConnectionStatus("Connesso");
      setIsConnected(true);
    });

    client.on("error", (err) => {
      console.error("Connection error: ", err);
      setConnectionStatus("Errore di connessione: " + err.message);
      setIsConnected(false);
      if (client) client.end();
    });

    client.on("reconnect", () => {
      console.log("Reconnecting...");
      setConnectionStatus("Riconnessione in corso...");
    });

    client.on("disconnect", () => {
      console.log("Disconnected");
      setConnectionStatus("Disconnesso");
      setIsConnected(false);
    });
  }

  function disconnect() {
    if (client && client.connected) {
      client.end();
      setConnectionStatus("Disconnesso");
      setIsConnected(false);
      console.log("Disconnected manually");
    }
  }

  function sendData() {
    if (!client || !client.connected) {
      setMessageStatus("Connettiti prima di inviare messaggi");
      return;
    }

    // Pubblica il messaggio
    client.publish(
      "projectOneData",
      message.trim() || "messaggio predefinito",
      { qos: 2, retain: false },
      (error) => {
        if (error) {
          console.error("Publish error:", error);
          setMessageStatus("Errore nella pubblicazione: " + error.message);
        } else {
          console.log(
            "Message published successfully to topic 'projectOneData'"
          );
          setMessageStatus("Messaggio pubblicato con successo!");
          setMessage(""); // Puliamo l'input
        }
      }
    );
  }

  return (
    <div className="App">
      <h2>Client MQTT React</h2>
      <div className="status-container">
        <p>
          Stato:{" "}
          <span className={isConnected ? "connected" : "disconnected"}>
            {connectionStatus}
          </span>
        </p>
        {messageStatus && <p className="message-status">{messageStatus}</p>}
      </div>
      <div className="input-container">
        <input
          type="text"
          placeholder="Testo da inviare..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={sendData}>Invia</button>
      </div>
      <div>
        <button onClick={connect} disabled={isConnected}>
          Connettiti
        </button>
        <button onClick={disconnect} disabled={!isConnected}>
          Disconnettiti
        </button>
      </div>
    </div>
  );
}

export default MqttClientPage;
