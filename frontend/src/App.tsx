import {useState } from "react";
import "./App.css";
import RollForm from "./components/RollForm.tsx";
import RollHistory from "./components/RollHistory";
import { useDiceSocket } from "./hooks/useDiceSocket.ts";


function App() {
  const {
  socket,
  latestRolls,
  error,
  connectionStatus,
  sendRoll,
} = useDiceSocket();

  const [name, setName] = useState("");
  const [expression, setExpression] = useState<string>("");

  return (
    <main className="app">
      <p>
        Estado:{" "}
        {connectionStatus === "connected"
          ? "Conectado"
          : connectionStatus === "connecting"
            ? "Conectando..."
            : "Desconectado"}
      </p>
      <h1>Tirador de dados</h1>
      <RollForm
        name={name}
        expression={expression}
        onNameChange={setName}
        onExpressionChange={setExpression}
        onRoll={() => sendRoll(name, expression)}
        connected={socket != null}
      />  
      {error !== null && (
        <p className="error">{error}</p>
      )}
      <RollHistory latestRolls={latestRolls} />
    </main>
  );
}

export default App;