import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import MessagesPage from "./pages/MessagesPage";
import MqttPage from "./pages/MqttClient";
import ProtectedRoute from "./components/ProtectedRoutes";
import { AppProvider, useAppContext } from "./context/AppContext";
import "./App.css";

import { createTheme, ThemeProvider } from "@mui/material";

const theme = createTheme({
  palette: {
    primary: {
      main: "#58c4dc",
    },
  },
});

function AppContent() {
  const { isLoggedIn, logout } = useAppContext(); // Prendiamo flag e metodo da AppContext

  return (
    <div className="App">
      <nav>
        <Link to="/client">MQTT Client</Link>
        <Link to="/msg">Messages</Link>
        {isLoggedIn && <button onClick={logout}>Logout</button>}
      </nav>

      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route
          path="/client"
          element={
            <ProtectedRoute>
              <MqttPage />
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
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AppProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
