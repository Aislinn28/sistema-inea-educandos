import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../store/auth";

const routes = [
  {
    path: "/login",
    name: "login",
    component: () => import("../views/LoginView.vue"),
    meta: { publica: true },
  },
  {
    path: "/restablecer-password/:token?",
    name: "recuperar",
    component: () => import("../views/RecuperarView.vue"),
    meta: { publica: true },
  },
  {
    path: "/",
    name: "dashboard",
    component: () => import("../views/DashboardView.vue"),
  },
  {
    path: "/educandos",
    name: "educandos",
    component: () => import("../views/EducandosView.vue"),
  },
  {
    path: "/usuarios",
    name: "usuarios",
    component: () => import("../views/UsuariosView.vue"),
    meta: { rolesPermitidos: ["admin"] },
  },
  {
    path: "/historial",
    name: "historial",
    component: () => import("../views/HistorialView.vue"),
    meta: { rolesPermitidos: ["admin"] },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const auth = useAuthStore();

  if (!to.meta.publica && !auth.estaAutenticado) {
    return { name: "login" };
  }

  if (to.meta.rolesPermitidos && !to.meta.rolesPermitidos.includes(auth.rol)) {
    return { name: "dashboard" };
  }

  if (to.name === "login" && auth.estaAutenticado) {
    return { name: "dashboard" };
  }
});

export default router;
