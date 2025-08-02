import endpoints from "@/api/apiRoutes";
import { LoginResponse } from "@/types/apiType";

export async function desconectarUsuario(username: string): Promise<void> {
  await fetch(endpoints.removerUsuario(username), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  sessionStorage.removeItem("token");
  sessionStorage.removeItem("username");
  alert("Você foi desconectado do servidor.");
};

export async function buscarCredencial(
  username: string,
  password: string
): Promise<LoginResponse> {
  const response = await fetch(endpoints.login, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: username,
      password: password,
    }),
  });

  const data = await response.json();

  sessionStorage.setItem("token", data.password);
  sessionStorage.setItem("username", data.username);

  return {
    username: data.dados.username,
    password: data.dados.password,
    mensagem: data.dados.mensagem,
  };
};

export async function handleListarUsuariosOnline(): Promise<string[]> {
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

    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return [];
  }
};