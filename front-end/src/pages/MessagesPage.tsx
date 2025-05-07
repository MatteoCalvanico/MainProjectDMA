import { useEffect, useState } from "react";
import "../App.css";

interface Message {
  _id: string;
  timestamp: string;
  metadata: {
    topic: string;
    payload: string;
    userId: string;
  };
}

function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMessages() {
      setLoading(true);
      setError(null);

      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          throw new Error("User ID not found. Please log in again.");
        }

        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
          throw new Error(
            "Authentication token not found. Please log in again."
          );
        }

        const response = await fetch(
          `http://localhost:8000/retrive/user/${userId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch messages");
        }

        const data = await response.json();
        setMessages(data.message || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        console.error("Error fetching messages:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchMessages();
  }, []);

  // Formatter per la data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="message-history-container">
      <h2>Storico Messaggi</h2>

      {loading && <p className="loading-text">Caricamento...</p>}
      {error && <div className="error-message">{error}</div>}

      {!loading && !error && messages.length === 0 && (
        <p className="empty-state">Non hai ancora inviato nessun messaggio!</p>
      )}

      {messages.length > 0 && (
        <div className="messages-list">
          {messages.map((message) => (
            <div key={message._id} className="message-item">
              <div className="message-timestamp">
                {formatDate(message.timestamp)}
              </div>
              <div className="message-content">{message.metadata.payload}</div>
              <div className="message-topic">
                Topic: {message.metadata.topic}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MessagesPage;
