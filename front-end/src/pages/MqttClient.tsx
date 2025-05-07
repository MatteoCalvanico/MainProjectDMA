import { useState } from "react";
import { useAppContext } from "../context/AppContext";

function MqttClientPage() {
  const [message, setMessage] = useState("");
  const [messageStatus, setMessageStatus] = useState("");
  const { isConnected, connectionStatus, client, connect, disconnect } =
    useAppContext(); // Prendiamo flags e metodi dall'AppContext

  function sendData() {
    if (!client || !client.connected) {
      setMessageStatus("Connettiti prima di inviare messaggi");
      return;
    }

    // Pubblica il messaggio
    client.publish(
      "projectOneData",
      localStorage.getItem("userId") +
        "|" +
        (message.trim() || "messaggio predefinito"), // message will be: "userId|content"
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
