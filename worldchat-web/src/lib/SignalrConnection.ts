import * as signalR from "@microsoft/signalr";

export default function createSignalRConnection(
  token: string,
  onReceiveMessage: (user: string, message: string) => void,
  onUserConnected: (user: string) => void,
  onUserDisconnected: (user: string) => void,
  onReceivedConnectionId: (connectionId: string) => void
) {
  const connection = new signalR.HubConnectionBuilder()
    .withUrl("https://localhost:7071/chats", {
      accessTokenFactory: () => token,
    })
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Information)
    .build();

  connection.on("ReceiveMessage", onReceiveMessage);
  connection.on("UserConnected", onUserConnected);
  connection.on("UserDisconnected", onUserDisconnected);
  connection.on("ReceivedConnectionId", onReceivedConnectionId);

  connection.onclose(() => {
    console.error("Conexão encerrada. Tentando reconectar...");
  });

  return connection;
}
