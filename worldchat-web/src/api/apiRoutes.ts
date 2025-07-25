const url = "https://localhost:7071/api";

const endpoints = {
  "login": `${url}/Usuarios/login`,
  "register": `${url}/Usuarios/register`,

  "listarUsuarios": `${url}/Redis/usuarios-online`,
  "adicionarUsuario": (userId: string) => `${url}/Redis/adicionar-usuario-online/${userId}`,
  "removerUsuario": (userId: string) => `${url}/Redis/remover-usuario-online/${userId}`,
};

export default endpoints;