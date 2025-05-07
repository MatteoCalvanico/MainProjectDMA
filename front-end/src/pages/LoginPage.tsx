import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const LoginPage = () => {
  const [isLoginForm, setIsLoginForm] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAppContext(); // Prendiamo la funzione di login dall'AppContext

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validazioni varie
      if (!email || !password) {
        throw new Error("Compila tutti i campi");
      }
      if (password.length < 6) {
        throw new Error("La password deve avere almeno 6 caratteri");
      }
      if (!/\S+@\S+\.\S+/.test(email)) {
        throw new Error("inserisci un'email valida");
      }

      // Scegliamo endpoint in base al flag
      const endpoint = isLoginForm ? "/login" : "/register";

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

      // Funzione di login (presa da AppContext, guarda sopra)
      login(data.data.accessToken, data.data.uid);

      // Redirect
      navigate("/client");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>{isLoginForm ? "Login" : "Register"}</h2>

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
            {loading ? "Processing..." : isLoginForm ? "Login" : "Register"}
          </button>
        </div>
      </form>

      <div className="toggle-form">
        <p>
          {isLoginForm ? "Non hai un account?" : "hai già un account?"}
          <button
            className="text-button"
            onClick={() => setIsLoginForm(!isLoginForm)} // Modifichiamo il flag usando l'useState
            disabled={loading}
          >
            {isLoginForm ? "Register" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
