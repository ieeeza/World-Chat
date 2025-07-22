"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import endpoints from "@/api/apiRoutes";
import styles from "./page.module.css";

type serverResponse = {
  dados: string;
  mensagem: string;
  sucesso: boolean;
  horaResposta: string;
};

export default function Login() {
  const router = useRouter();

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const [style, setStyle] = useState({
    isLoading: false,
    errorUsername: false,
    errorPassword: false,
  });

  async function fetchLogin() {
    try {
      return await fetch(endpoints.login, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      setError("Erro ao conectar ao servidor. Tente novamente mais tarde.");
      setStyle({ ...style, isLoading: false });
      return { status: 500, json: () => ({ mensagem: "Erro de conexão" }) };
    }
  }

  async function handleInputs() {
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

  async function validateStatusResponse(jwtToken: serverResponse) {
    if (jwtToken.mensagem == "Usuário não encontrado.") {
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

  async function handleLogin() {
    setStyle({ ...style, isLoading: true });

    await handleInputs();

    const response = await fetchLogin();

    try {
      const jwtToken = await response.json();
      localStorage.setItem("token", jwtToken.dados.password);

      const isValid = await validateStatusResponse(jwtToken);
      if (!isValid) return;

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
            className={style.errorUsername ? styles.inputError : styles.input}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            onChange={(e) => setPassword(e.target.value)}
            onClick={() => setStyle({ ...style, errorPassword: false })}
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
