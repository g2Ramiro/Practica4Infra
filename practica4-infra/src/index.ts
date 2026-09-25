export interface Env {
  p6: D1Database;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Creamos una ruta específica para leer los usuarios
    if (url.pathname === "/users" && request.method === "GET") {
      try {
        // 2. Preparamos y ejecutamos la consulta SQL
        const { results } = await env.p6.prepare("SELECT * FROM users").all();

        // 3. Devolvemos los resultados en formato JSON
        return Response.json(results);
      } catch (e) {
        return new Response("Error al leer la base de datos", { status: 500 });
      }
    }

    // Ruta por defecto
    return new Response("¡Hola! Ve a /users para leer la base de datos.");
  },
};
