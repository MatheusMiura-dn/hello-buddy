import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext, useRouter, HeadContent, Scripts } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return <div style={{minHeight:"100vh",display:"grid",placeItems:"center",fontFamily:"sans-serif"}}><div style={{textAlign:"center"}}><h1>404</h1><p>Esta página não existe.</p><Link to="/">Voltar para a The Archive</Link></div></div>;
}
function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error); const router = useRouter();
  useEffect(() => { reportLovableError(error, { boundary: "tanstack_root_error_component" }); }, [error]);
  return <div style={{minHeight:"100vh",display:"grid",placeItems:"center",fontFamily:"sans-serif"}}><div style={{textAlign:"center"}}><h1>Algo deu errado</h1><p>Recarregue a página e tente novamente.</p><button onClick={() => {router.invalidate();reset();}}>Tentar novamente</button></div></div>;
}
export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({ meta: [
    { charSet: "utf-8" }, { name: "viewport", content: "width=device-width, initial-scale=1" },
    { title: "The Archive — Curated Clothing" }, { name: "description", content: "Peças contemporâneas, clássicas e atemporais. Descubra a curadoria The Archive." },
    { property: "og:title", content: "The Archive — Curated Clothing" }, { property: "og:description", content: "Luxo discreto, materiais selecionados e design atemporal." }, { property: "og:type", content: "website" },
    { name: "theme-color", content: "#171717" }
  ], links: [{ rel: "stylesheet", href: appCss }]
  }),
  shellComponent: RootShell, component: RootComponent, notFoundComponent: NotFoundComponent, errorComponent: ErrorComponent,
});
function RootShell({ children }: { children: ReactNode }) { return <html lang="pt-BR"><head><HeadContent /></head><body>{children}<Scripts /></body></html>; }
function RootComponent() { const { queryClient } = Route.useRouteContext(); return <QueryClientProvider client={queryClient}><Outlet /></QueryClientProvider>; }
