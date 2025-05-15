// app/routes.ts - Atualizado para incluir a rota de diagnóstico
import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  // rota raiz para a página home
  index("routes/home.tsx"),
  // rota GET /test para o componente TestStorageConnection
  route("test", "routes/test.tsx"),
  // nova rota para o diagnóstico específico do bucket
  route("bucket-diagnostic", "routes/bucket-diagnostic.tsx"),
] satisfies RouteConfig;