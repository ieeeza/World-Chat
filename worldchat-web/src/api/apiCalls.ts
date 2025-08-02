import endpoints from "@/api/apiRoutes";
import { LoginResponse } from "@/types/apiType";

export async function desconectarUsuario(username: string): Promise<void> {
  await fetch(endpoints.removerUsuario(username), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  localStorage.removeItem("token");
  localStorage.removeItem("username");
  alert("Você foi desconectado do servidor.");
}

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

  localStorage.setItem("token", data.password);
  localStorage.setItem("username", data.username);

  return {
    username: data.dados.username,
    password: data.dados.password,
    mensagem: data.dados.mensagem,
  };
}

