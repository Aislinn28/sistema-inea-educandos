import { defineStore } from "pinia";
import api from "../services/api";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem("token") || null,
    usuario: JSON.parse(localStorage.getItem("usuario") || "null"),
  }),

  getters: {
    estaAutenticado: (state) => !!state.token,
    rol: (state) => state.usuario?.rol || null,
  },

  actions: {
    async login(correo, password) {
      const { data } = await api.post("/auth/login", { correo, password });
      this.token = data.token;
      this.usuario = data.usuario;
      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", JSON.stringify(data.usuario));
    },

    cerrarSesion() {
      this.token = null;
      this.usuario = null;
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
    },
  },
});
