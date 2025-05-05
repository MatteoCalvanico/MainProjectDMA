import { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate input
      if (!email || !password) {
        throw new Error("Compila tutti i campi");
      }

      if (password.length < 6) {
        throw new Error("La password deve avere almeno 6 caratteri");
      }

      // Email validation
      if (!/\S+@\S+\.\S+/.test(email)) {
        throw new Error("inserisci un'email valida");
      }

      // Determine endpoint based on action
      const endpoint = isLogin ? "/login" : "/register";

      // Call the API
      const response = await fetch(`http://localhost:8000/auth${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Authentication failed");
      }

      // Save token to localStorage
      localStorage.setItem("authToken", data.data.accessToken);
      localStorage.setItem("userId", data.data.uid);

      // Redirect to MQTT client
      navigate("/client");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>{isLogin ? "Login" : "Register"}</h2>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="input-container">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="input-container">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="button-container">
          <button type="submit" disabled={loading}>
            {loading ? "Processing..." : isLogin ? "Login" : "Register"}
          </button>
        </div>
      </form>

      <div className="toggle-form">
        <p>
          {isLogin ? "Non hai un account?" : "hai già un account?"}
          <button
            className="text-button"
            onClick={() => setIsLogin(!isLogin)}
            disabled={loading}
          >
            {isLogin ? "Register" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
