import React, { createContext, useContext, useState, useEffect } from "react";
import mqtt, { MqttClient } from "mqtt";

interface AppContextType {
  isLoggedIn: boolean;
  isConnected: boolean;
  authLoading: boolean;
  connectionStatus: string;
  client: MqttClient | null;
  login: (token: string, userId: string) => void;
  logout: () => void;
  connect: () => void;
  disconnect: () => void;
}

// Creiamo un context per evitare di usare i props per passare flag/metodi ad altri componenti
const AppContext = createContext<AppContextType | undefined>(undefined);

// Gestisce in maniera centralizzata l'auth e MQTT con i vari stati e metodi
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [client, setClient] = useState<MqttClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Disconnesso");
  const [authLoading, setAuthLoading] = useState(true);

  // Controllo se già loggato
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setIsLoggedIn(true);
    }
    setAuthLoading(false);
  }, []);

  const login = (token: string, userId: string) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("userId", userId);
    setIsLoggedIn(true);
  };

  const logout = () => {
    // Se connesso facciamo la disconnessione a MQTT
    if (client && client.connected) {
      client.end();
    }
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    setIsLoggedIn(false);
    setIsConnected(false);
    setConnectionStatus("Disconnesso");
    setClient(null);
  };

  const connect = () => {
    // Evita connessioni multiple
    if (client && client.connected) {
      console.log("Già connesso");
      return;
    }

    // Otteniamo accessToken
    const accessToken = localStorage.getItem("authToken");
    if (!accessToken) {
      console.error("Access token is missing. Please login first.");
      setConnectionStatus("Errore: Token di accesso mancante");
      return;
    }

    const host = import.meta.env.REACT_APP_MQTT_HOST || "localhost";
    const port = import.meta.env.REACT_APP_MQTT_PORT || "8000";
    const path = import.meta.env.REACT_APP_MQTT_PATH || "/mqtt-ws";
    const clientId = `mqtt_${Math.random().toString(16).slice(3)}`;

    const connectUrl = `ws://${host}:${port}${path}?jwt=${accessToken}`;

    setConnectionStatus("Connessione in corso...");

    const mqttClient = mqtt.connect(connectUrl, {
      clientId,
      clean: true,
      connectTimeout: 4000,
      username: import.meta.env.REACT_APP_RABBITMQ_USER || "guest",
      password: import.meta.env.REACT_APP_RABBITMQ_PASSWORD || "guest",
      reconnectPeriod: 1000,
    });

    setClient(mqttClient);

    mqttClient.on("connect", () => {
      console.log("Connected");
      setConnectionStatus("Connesso");
      setIsConnected(true);
    });

    mqttClient.on("error", (err) => {
      console.error("Connection error: ", err);
      setConnectionStatus("Errore di connessione: " + err.message);
      setIsConnected(false);
      if (mqttClient) mqttClient.end();
    });

    mqttClient.on("reconnect", () => {
      console.log("Reconnecting...");
      setConnectionStatus("Riconnessione in corso...");
    });

    mqttClient.on("disconnect", () => {
      console.log("Disconnected");
      setConnectionStatus("Disconnesso");
      setIsConnected(false);
    });
  };

  const disconnect = () => {
    if (client && client.connected) {
      client.end();
      setConnectionStatus("Disconnesso");
      setIsConnected(false);
      console.log("Disconnected manually");
    }
  };

  return (
    // Il Provider permette di fornire le funzionlità qui create a tutti gli altri componenti figli
    <AppContext.Provider
      value={{
        isLoggedIn,
        authLoading,
        isConnected,
        connectionStatus,
        client,
        login,
        logout,
        connect,
        disconnect,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Importa questo Hook invece che useContext e il context in ogni file
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
