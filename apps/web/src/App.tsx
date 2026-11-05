import { useAuth } from "./hooks/useAuth";
import { LoginPage } from "./pages/LoginPage";
import { TicketsPage } from "./pages/TicketsPage";

export function App() {
  const auth = useAuth();
  return auth.isAuthenticated ? <TicketsPage auth={auth} /> : <LoginPage auth={auth} />;
}
