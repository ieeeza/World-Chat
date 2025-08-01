import { desconectarUsuario } from "@/api/apiCalls";
import * as signalR from "@microsoft/signalr";

export default function createSignalRConnection(
  token: string,
  onReceiveMessage: (user: string, message: string, isMine: boolean) => void,
  onUserConnected: (user: string) => void,
  onUserDisconnected: (user: string) => void,
) {
  const username = sessionStorage.getItem("username");

  const connection = new signalR.HubConnectionBuilder()
    .withUrl("https://worldchat-backend-latest.onrender.com/chats", {
      accessTokenFactory: () => token,
    })
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Information)
    .build();

  connection.on("ReceiveMessage", onReceiveMessage);
  connection.on("UserConnected", onUserConnected);
  connection.on("UserDisconnected", onUserDisconnected);

  connection.onclose(async () => {
    try {
      if (username) {
        await desconectarUsuario(username);
      }
    } catch (error) {
      console.error("Erro ao desconectar usuário:", error);
    }
  });

  return connection;
}
