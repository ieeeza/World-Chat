"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import createSignalRConnection from "@/lib/SignalrConnection";
import { HubConnection } from "@microsoft/signalr";
import { desconectarUsuario } from "@/api/apiCalls";
import { ChatMessage, Usuario } from "@/types/useStateType";
import endpoints from "@/api/apiRoutes";
import styles from "./page.module.css";

export default function Chats() {
  const router = useRouter();

  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [inputText, setInputText] = useState<string>("");
  const [chatLog, setChatLog] = useState<ChatMessage[]>([]);
  const [usuariosConnectados, setUsuariosConnectados] = useState<Usuario[]>([]);
  const [connectionId, setConnectionId] = useState<string>("");

  const username: string = localStorage.getItem("username") || "";
  const token: string = localStorage.getItem("token") || "";

  if (!username || !token) {
    router.push("/login");
  }

  useEffect(() => {
    const newConnection = createSignalRConnection(
      token,
      (user: string, message: string) => {
        const isMyMessage = user === username;
        setChatLog((prev) => [
          ...prev,
          { sender: user, text: message, isMine: isMyMessage },
        ]);
      },
      (username: string) => {
        const novoUsuario: Usuario = {
          connectionId: connectionId,
          username,
          mensages: 0,
        };

        setUsuariosConnectados((prev) => [...prev, novoUsuario]);
      },
      (username: string) => {
        removeUserFromList(username);
      },
      (connectionId: string) => {
        setConnectionId(connectionId);
        console.log("Connection ID received:", connectionId);
      }
    );

    newConnection.start().then(() => {
      setConnection(newConnection);
    });

    return () => {
      newConnection.stop();
    };
  }, [connectionId, router, token, username]);

  useEffect(() => {
    async function fetchUsuarios() {
      const usuarios = await handleListarUsuariosOnline();

      setUsuariosConnectados((prev) => {
        const novosUsuarios = usuarios
          .filter((username) => !prev.some((u) => u.username === username))
          .map((username) => ({
            connectionId: connectionId,
            username,
            mensages: 0,
          }));

        return [...prev, ...novosUsuarios];
      });
    }

    fetchUsuarios();
  }, [connectionId]);

  async function handleListarUsuariosOnline(): Promise<string[]> {
    try {
      const response = await fetch(endpoints.listarUsuarios, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao buscar usuários");
      }

      const usuarios: string[] = await response.json();

      return usuarios;
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      return [];
    }
  }

  // async function handleAddMessageCount(username: string): Promise<void> {
  //   const usuario = usuariosConnectados.find((u) => u.username === username);
  //   if (usuario) {
  //     const updatedUsuario: Usuario = {
  //       ...usuario,
  //       mensages: usuario.mensages + 1,
  //     };

  //     setUsuariosConnectados((prev) =>
  //       prev.map((u) => (u.username === username ? updatedUsuario : u))
  //     );
  //   }
  // }

  async function handleSendMessage(username: string): Promise<void> {
    if (connection && inputText.trim() !== "") {
      try {
        await connection.invoke("SendMessage", inputText);
        //await handleAddMessageCount(username);
        setInputText("");
      } catch (err) {
        alert("Erro ao enviar mensagem. Tente novamente.");
        console.error("Erro ao enviar mensagem:", err);
      }
    }
  }

  async function handleSair() {
    connection?.stop();
    desconectarUsuario(localStorage.getItem("username") || "");
    router.push("/login");
  }

  function removeUserFromList(user: string) {
    setUsuariosConnectados((prev) => prev.filter((x) => x.username !== user));
  }

  return (
    <div className={styles.body}>
      <div className={styles.container}>
        <div className={styles.header}>
          <p className={styles.logo}>WORLD CHAT</p>
          <button
            title="sair"
            type="button"
            onClick={handleSair}
            className={styles.sairButton}
          >
            Sair
          </button>
        </div>
        <main className={styles.main}>
          <div className={styles.sideLeftBar}>
            <div className={styles.topSendersContainer}>
              <p>Top Senders</p>
              <p>Most active users in the chat</p>
            </div>
            <div className={styles.topSenders}>
              <div className={styles.topSendersListProfile}>
                {usuariosConnectados
                  .toSorted((a, b) => b.mensages - a.mensages)
                  .slice(0, 5)
                  .map((usuario, index) => (
                    <div key={index++} className={styles.topSender}>
                      <p className={styles.topSenderUsername}>
                        {usuario.username}
                      </p>
                      <p className={styles.topSenderMensages}>
                        Mensagens: {usuario.mensages}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
          <div className={styles.middleBar}>
            <p className={styles.middleBarTittle}>Chat Messages</p>
            <div className={styles.chatMessages}>
              {chatLog.map((msg, messageId) => (
                <div
                  key={messageId++}
                  className={
                    msg.isMine
                      ? styles.chatMessagesSenderContainer
                      : styles.chatMessagesReceivedContainer
                  }
                >
                  {!msg.isMine && (
                    <p className={styles.chatMessagesReceivedUser}>
                      {msg.sender}:
                    </p>
                  )}
                  <p>{msg.text}</p>
                </div>
              ))}
            </div>
            <div className={styles.textInputContainer}>
              <input
                type="text"
                placeholder="Digite sua mensagem"
                className={styles.inputText}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <button
                className={styles.sendButton}
                type="button"
                onClick={() => handleSendMessage(username)}
              >
                ENVIAR
              </button>
            </div>
          </div>
          <div className={styles.rightBar}>
            <p className={styles.rightBarTitle}>Online Users</p>
            <div className={styles.onlineUsers}>
              {usuariosConnectados.map((usuario, index) => (
                <p key={index++} className={styles.onlineUser}>
                  {usuario.username}
                </p>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
