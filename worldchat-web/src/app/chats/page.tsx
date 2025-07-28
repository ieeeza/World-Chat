"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import createSignalRConnection from "@/lib/SignalrConnection";
import { HubConnection } from "@microsoft/signalr";
import { desconectarUsuario } from "@/api/apiCalls";
import { ChatMessage } from "@/types/useStateType";
import endpoints from "@/api/apiRoutes";
import styles from "./page.module.css";

export default function Chats() {
  const router = useRouter();

  const username = localStorage.getItem("username");
  const token = localStorage.getItem("username");

  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [inputText, setInputText] = useState<string>("");
  const [chatLog, setChatLog] = useState<ChatMessage[]>([]);
  const [usuariosConnectados, setUsuariosConnectados] = useState<string[]>([]);

  useEffect(() => {
    if (!username || !token) {
      router.push("/login");
    }
  }, [username, token, router]);

  useEffect(() => {
    const token: string = localStorage.getItem("token") || "";

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
        setUsuariosConnectados((prev) => [...prev, username]);
      },
      (username: string) => {
        removeUserFromList(username);
      },
      (connectionId: string) => {
        alert(`Você está conectado com o ID: ${connectionId}`);
      }
    );

    newConnection.start().then(() => {
      setConnection(newConnection);
    });

    return () => {
      newConnection.stop();
    };
  }, [username]);

  useEffect(() => {
    async function fetchUsuarios() {
      const usuarios = await handleListarUsuariosOnline();
      setUsuariosConnectados(usuarios);
    }

    fetchUsuarios();
  }, []);

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
      console.log("Usuários conectados:", usuarios);

      return usuarios;
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      return [];
    }
  }

  async function handleSendMessage(): Promise<void> {
    if (connection && inputText.trim() !== "") {
      try {
        await connection.invoke("SendMessage", inputText);
        setInputText("");
      } catch (err) {
        alert("Erro ao enviar mensagem. Tente novamente.");
        console.error("Erro ao enviar mensagem:", err);
      }
    }
  }

  async function handleSair() {
    connection?.stop();
    desconectarUsuario(username || "");
    router.push("/login");
  }

  function removeUserFromList(user: string) {
    setUsuariosConnectados((prev) => prev.filter((u) => u !== user));
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
              <div className={styles.topSendersListProfile}></div>
              {/* Você pode adicionar lógica para contar mensagens por usuário */}
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
                onClick={handleSendMessage}
              >
                ENVIAR
              </button>
            </div>
          </div>
          <div className={styles.rightBar}>
            <p className={styles.rightBarTitle}>Online Users</p>
            <div className={styles.onlineUsers}>
              {usuariosConnectados.map((usuario) => (
                <p key={usuario} className={styles.onlineUser}>{usuario}</p>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
