import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import "./App.css";

import MqttPage from "./pages/MqttClient";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoutes";
import MessagesPage from "./pages/MessagesPage";

function App() {
  const isLoggedIn = localStorage.getItem("authToken") !== null;

  return (
    <BrowserRouter>
      <div className="App">
        <nav>
          <Link to="/client">MQTT Client</Link>
          <Link to="/msg">Messages</Link>
          {isLoggedIn && (
            <button 
              onClick={() => {
                localStorage.removeItem("authToken");
                localStorage.removeItem("userId");
                window.location.href = "/";
              }}
            >
              Logout
            </button>
          )}
        </nav>

        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route 
            path="/client" 
            element={
              <ProtectedRoute>
                <MqttPage />
                <MessagesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/msg" 
            element={
              <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;