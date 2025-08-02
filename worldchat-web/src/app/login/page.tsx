"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { buscarCredencial } from "@/api/apiCalls";
import { StyleState } from "@/types/useStateType";
import { LoginResponse } from "@/types/apiType";
import styles from "./page.module.css";

export default function Login() {
  const router = useRouter();

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const [style, setStyle] = useState<StyleState>({
    isLoading: false,
    errorUsername: false,
    errorPassword: false,
  });

  async function handleInputs(): Promise<void> {
    if (!username || username.trim() === "") {
      setError("Por favor, preencha o campo nome de usuário.");
      setStyle({ ...style, errorUsername: true });
      return;
    } else if (!password || password.trim() === "") {
      setError("Por favor, preencha o campo senha.");
      setStyle({ ...style, errorPassword: true });
      return;
    }
    setError("");
  }

  async function validateStatusResponse(
    response: LoginResponse
  ): Promise<boolean> {
    if (response.mensagem == "Usuário não encontrado.") {
      setStyle({
        ...style,
        errorUsername: true,
        errorPassword: true,
        isLoading: false,
      });
      setUsername("");
      setPassword("");
      setError("Usuário não encontrado. Verifique suas credenciais.");
      return false;
    }
    return true;
  }

  async function handleLogin(): Promise<void> {
    setStyle({ ...style, isLoading: true });

    await handleInputs();

    try {
      const response = await buscarCredencial(username, password);

      const isValid = await validateStatusResponse(response);
      if (!isValid) return;

      sessionStorage.setItem("username", response.username);
      sessionStorage.setItem("token", response.password);

      setStyle({ ...style, isLoading: false });
      setError("");
      router.push("/chats");
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      setStyle({ ...style, isLoading: false });
      setError(`Tente novamente, caso persista entre em contato.`);
    }
  }

  function handleVoltar() {
    router.push("/");
  }

  return (
    <div className={styles.body}>
      <div className={styles.container}>
        <h1 className={styles.title}>Login to WorldChat</h1>
        <p className={styles.description}>
          Entre na sua conta e comece a conversar com o mundo.
        </p>
        <div className={styles.form}>
          <input
            type="text"
            placeholder="Nome de usuário"
            onChange={(e) => setUsername(e.target.value)}
            onClick={() => setStyle({ ...style, errorUsername: false })}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleLogin();
              }
            }}
            className={style.errorUsername ? styles.inputError : styles.input}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            onChange={(e) => setPassword(e.target.value)}
            onClick={() => setStyle({ ...style, errorPassword: false })}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleLogin();
              }
            }}
            className={style.errorPassword ? styles.inputError : styles.input}
            required
          />
          <div className={styles.buttons}>
            <button
              type="button"
              onClick={handleLogin}
              className={styles.button}
            >
              {style.isLoading ? (
                <p className={styles.loader}></p>
              ) : (
                <p>Entrar</p>
              )}
            </button>
            <button
              type="button"
              onClick={handleVoltar}
              className={styles.button}
            >
              <p>Voltar</p>
            </button>
          </div>
          {error ? <p className={styles.error}>{error}</p> : null}
        </div>
      </div>
    </div>
  );
}
