import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./App.css";

type RollResult = {
  id: string
  name: string;
  details: string;
  total: number;
}

type ServerResponse =
  | {
      type: "history";
      data: RollResult[];
    }
  | {
      type: "roll";
      data: RollResult;
    }
  | {
      type: "error";
      data: string;
    };

function App() {
  const [name, setName] = useState("");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [latestRolls, setLatestRolls] = useState<RollResult[]>([]);
  const [expression, setExpression] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("disconnected")

  useEffect(() => {
    let activeSocket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout>
    let stopped: boolean = false

    function connect(){
      activeSocket = new WebSocket("ws://127.0.0.1:8000/ws");
      setConnectionStatus("connecting")

      activeSocket.onopen = () => {
        console.log("WebSocket conectado");
        setConnectionStatus("connected")
        setSocket(activeSocket);
      };

      activeSocket.onmessage = (event) => {
        const serverResponse: ServerResponse = JSON.parse(event.data);
        if (serverResponse.type === "history") {
          const rollList: RollResult[] = serverResponse.data
          rollList.forEach((roll) => console.log("Tirada Recibida: ", roll.details, " Total: ", roll.total));
          setLatestRolls(rollList);

        } else if (serverResponse.type === "roll") {
          const roll: RollResult = serverResponse.data
          console.log("Tirada Recibida: ", roll.details, " Total: ", roll.total);
          setLatestRolls((previousRolls) => ([(roll), ...previousRolls]));

        } else if (serverResponse.type == "error"){
          const message: string = serverResponse.data
          setError(message)
          console.log("Error: ", message)
        }
      };

      activeSocket.onclose = () => {
        console.log("WebSocket desconectado");
        setSocket(null);
        setConnectionStatus("disconnected")
        if (!stopped){
          reconnectTimer = setTimeout(connect, 2000)
        }
      };
    }

    connect()

    return () => {
      stopped = true
      clearTimeout(reconnectTimer)
      activeSocket?.close();
    };
  }, []);

function handleRoll() {
  if (socket === null) {
    return;
  }

  setError(null)

  socket.send(
    JSON.stringify({
      name: name,
      expression: expression,
    }),
  );
}

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
      <div className="input-container">
        <label>
          Nombre
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Tu nombre"
          />
        </label>

        <label>
          Tirada
          <input
            value={expression}
            onChange={(event) => setExpression(event.target.value)}
            placeholder="Expresión de dados"
          />
        </label>

        <button onClick={handleRoll} disabled={!name.trim() || socket === null || (expression == "")}>
          Tirar
        </button>
      </div>
      {error !== null && (
        <p className="error">{error}</p>
      )}
      <div className="latestRolls" hidden={latestRolls.length === 0}>
        {latestRolls.map((roll) => (
        <div className="rollEntry" key={roll.id}>
          <span className="rollHeader">
            <strong>{roll.name}</strong>
          </span>

          <span className="rollDetails">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {roll.details}
            </ReactMarkdown>
          </span>
        </div>
        ))}

      </div>
    </main>
  );
}

export default App;