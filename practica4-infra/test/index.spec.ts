import { describe, it, expect } from "vitest";
import worker from "../src/index";
import { ExecutionContext } from "@cloudflare/workers-types";

describe("Worker API Tests", () => {
  it("responde con el mensaje por defecto en la ruta raíz", async () => {
    // Simulamos un entorno vacío para la ruta principal
    const mockEnv = { p6: {} };
    const request = new Request("http://localhost/", { method: "GET" });
    const ctx = {} as ExecutionContext;

    const response = await worker.fetch(request, mockEnv as any, ctx);

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("¡Hola! Ve a /users para leer la base de datos.");
  });

  it("responde con los usuarios en la ruta /users (flujo exitoso)", async () => {
    // 1. Simulamos el entorno y la respuesta de la base de datos D1
    const mockEnv = {
      p6: {
        prepare: () => ({
          all: async () => ({ results: [{ nombre: "Ramiro" }] }),
        }),
      },
    };

    const request = new Request("http://localhost/users", { method: "GET" });
    const ctx = {} as ExecutionContext;

    // 2. Ejecutamos la función del worker
    const response = await worker.fetch(request, mockEnv as any, ctx);

    // 3. Verificamos que la respuesta sea 200 y contenga los datos
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toEqual([{ nombre: "Ramiro" }]);
  });

  it("responde con error 500 si falla la base de datos (flujo de error)", async () => {
    // 1. Simulamos que la base de datos arroja un error
    const mockEnv = {
      p6: {
        prepare: () => ({
          all: async () => { throw new Error("Error de conexión D1"); },
        }),
      },
    };

    const request = new Request("http://localhost/users", { method: "GET" });
    const ctx = {} as ExecutionContext;

    const response = await worker.fetch(request, mockEnv as any, ctx);

    // 2. Verificamos que entre al bloque catch y devuelva estatus 500
    expect(response.status).toBe(500);
    const text = await response.text();
    expect(text).toBe("Error al leer la base de datos");
  });
});
