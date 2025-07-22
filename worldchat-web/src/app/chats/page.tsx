"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import createSignalRConnection from "@/lib/SignalrConnection";
import { HubConnection } from "@microsoft/signalr";
import endpoints from "@/api/apiRoutes";
import styles from "./page.module.css";

type ChatMessage = {
  sender: string;
  text: string;
};

export default function Chats() {
  const router = useRouter();

  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [inputText, setInputText] = useState<string>("");
  const [chatLog, setChatLog] = useState<ChatMessage[]>([]);
  const [usuariosConnectados, setUsuariosConnectados] = useState<string[]>([]);

  async function handleFetchUsuarios(): Promise<string[]> {
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

  useEffect(() => {
    const token: string = localStorage.getItem("token") || "";

    const newConnection = createSignalRConnection(
      token,
      (user: string, message: string) => {
        setChatLog((prev) => [...prev, { sender: user, text: message }]);
      },
      (username: string) => {
        setUsuariosConnectados((prev) => [...prev, username]);
      },
      (username: string) => {
        setUsuariosConnectados((prev) => prev.filter((u) => u !== username));
      },
      (connectionId: string) => {
        console.log("Minha connectionId:", connectionId);
      }
    );

    newConnection.start().then(() => {
      setConnection(newConnection);
    });

    return () => {
      newConnection.stop();
    };
  }, []);

  useEffect(() => {
    async function fetchUsuarios() {
      const usuarios = await handleFetchUsuarios();
      setUsuariosConnectados(usuarios);
    }

    fetchUsuarios();
  }, []);

  const handleSendMessage = async () => {
    if (connection && inputText.trim() !== "") {
      try {
        await connection.invoke("SendMessage", inputText);
        setInputText("");
      } catch (err) {
        alert("Erro ao enviar mensagem. Tente novamente.");
        console.error("Erro ao enviar mensagem:", err);
      }
    }
  };

  async function handleDesconectarUsuario(username: string) {
    try {
      await fetch(endpoints.removerUsuario(username), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Erro ao desconectar usuário:", error);
    }
  }

  async function handleSair() {
    connection?.stop();
    await handleDesconectarUsuario(username);
    router.push("/login");
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
              {chatLog.map((message, index) => (
                <p key={index} className={styles.chatMessagesReceived}>
                  {message.sender}: {message.text}
                </p>
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
                <p className={styles.onlineUser}>{usuario}</p>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
