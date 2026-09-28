import { useEffect, useState } from "react";
import type { RollResult, ServerResponse } from "../types";

type ConnectionStatus = "connecting" | "connected" | "disconnected";

export function useDiceSocket() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [latestRolls, setLatestRolls] = useState<RollResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");

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
            clearTimeout(reconnectTimer);
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

    function sendRoll(name:string, expression:string) {
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
    
    return { socket, latestRolls, error, connectionStatus, sendRoll };
}