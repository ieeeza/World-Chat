"use client";

import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function Home() {
  const router = useRouter();

  function handleVoltar() {
    router.push("/login");
  }

  function handleExplore() {
    router.push("/explore");
  }

  return (
    <div className={styles.body}>
      <div className={styles.container}>
        <h1 className={styles.title}>Welcome to WorldChat</h1>
        <p className={styles.description}>
          Um lugar para conversar com o mundo inteiro.
        </p>
        <div className={styles.grid}>
          <button
            title="login"
            type="button"
            onClick={handleExplore}
            className={styles.card}
          >
            <h2>Explore &rarr;</h2>
            <p>Descubra novas conversar e comunidades.</p>
          </button>
          <button
            title="login"
            type="button"
            onClick={handleVoltar}
            className={styles.card}
          >
            <h2>Login &rarr;</h2>
            <p>Acesse sua conta e comece a conversar.</p>
          </button>
        </div>
      </div>
      <footer className={styles.footer}>
        <p>© 2025 WorldChat. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
