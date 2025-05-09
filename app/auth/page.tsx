"use client";

import * as r from "react";
import { useRouter } from "next/navigation";
import { authenticateService } from "@/app/utils/api";
import { AuthPostRequest } from "@/app/interfaces/authInterfaces";

export default function AuthPage() {
  const [uniquePin, setUniquePin] = r.useState<string>("");
  const [error, setError] = r.useState<string>("");
  const router = useRouter();

  const handleSubmit = async (e: r.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const request: AuthPostRequest = {
        unique_pin: uniquePin,
      };
      await authenticateService(request);
      router.push("/");
    } catch (error) {
      console.error("Authentication error:", error);
      setError("Invalid unique pin");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">Autenticación</h1>
      <p className="text-gray-600 mb-4 text-center">
        Por favor, ingrese su PIN único para acceder a la aplicación.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          value={uniquePin}
          onChange={(e) => setUniquePin(e.target.value)}
          placeholder="Ingrese su PIN único"
          className="p-2 border border-gray-300 rounded-md text-center"
        />
        {error && <p className="text-red-500 text-center">{error}</p>}
        <button
          type="submit"
          className="bg-blue-500 cursor-pointer text-white p-2 rounded-md"
        >
          Autenticar
        </button>
      </form>
    </div>
  );
}
