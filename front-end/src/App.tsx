import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import "./App.css";

// Import your pages
import MqttPage from "./pages/MqttClient"; // Create this file with your current MQTT functionality
import LoginPage from "./pages/LoginPage";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <nav>
          <Link to="/client">MQTT Client</Link>
          <Link to="/">Login</Link>
        </nav>

        <Routes>
          <Route path="/client" element={<MqttPage />} />
          <Route path="/" element={<LoginPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
