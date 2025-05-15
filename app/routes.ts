import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  // rota raiz para a página home
  index("routes/home.tsx"),
  // rota GET /test para o componente TestStorageConnection
  route("test", "routes/test.tsx"),
] satisfies RouteConfig;
