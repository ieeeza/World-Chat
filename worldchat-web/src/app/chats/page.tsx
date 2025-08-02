"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import createSignalRConnection from "@/lib/SignalrConnection";
import { HubConnection } from "@microsoft/signalr";
import { desconectarUsuario, handleListarUsuariosOnline } from "@/api/apiCalls";
import { ChatMessage } from "@/types/useStateType";
import styles from "./page.module.css";

export default function Chats() {
  const router = useRouter();

  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [inputText, setInputText] = useState<string>("");
  const [chatLog, setChatLog] = useState<ChatMessage[]>([]);
  const [usuariosConnectados, setUsuariosConnectados] = useState<string[]>([]);

  const endOfMessages = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const username: string = sessionStorage.getItem("username") || "";
    const token: string = sessionStorage.getItem("token") || "";

    if (!username || !token) {
      router.push("/login");
    }

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
    );

    newConnection.start().then(() => {
      setConnection(newConnection);
    });

    return () => {
      newConnection.stop();
    };
  }, [router]);

  useEffect(() => {
    endOfMessages.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLog]);

  useEffect(() => {
    async function fetchUsuarios() {
      const usuarios: string[] = await handleListarUsuariosOnline();
      setUsuariosConnectados(usuarios);
    }

    fetchUsuarios();
  }, []);

  

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
    desconectarUsuario(sessionStorage.getItem("username") || "");
    router.push("/login");
  }

  function removeUserFromList(user: string) {
    setUsuariosConnectados((prev) => prev.filter((x) => x !== user));
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
          <div className={styles.middleBar}>
            <p className={styles.middleBarTittle}>CHAT MESSAGES</p>
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
              <div ref={endOfMessages}></div>
            </div>
            <div className={styles.textInputContainer}>
              <input
                type="text"
                placeholder="Digite sua mensagem"
                className={styles.inputText}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSendMessage();
                  }
                }}
              />
              <button
                className={styles.sendButton}
                type="button"
                onClick={() => handleSendMessage()}
              >
                ENVIAR
              </button>
            </div>
          </div>
          <div className={styles.rightBar}>
            <p className={styles.rightBarTitle}>ONLINE USERS</p>
            <div className={styles.onlineUsers}>
              {usuariosConnectados.map((usuario, index) => (
                <p key={index++} className={styles.onlineUser}>
                  {usuario}
                </p>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
