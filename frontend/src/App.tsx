import "./App.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider, Outlet, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { trpc, trpcClient } from "./utils/trpc/client";
import { AuthProvider } from "./contexts/auth";
import { useSession } from "./utils/auth/client";
import LoadingScreen from "./components/LoadingScreen";
import ErrorPage from "./pages/ErrorPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Dashboard from "./pages/Dashboard";
import MapPage from "./pages/MapPage";

const queryClient = new QueryClient();

function ProtectedLayout() {
  const { data: session, isPending } = useSession();
  if (isPending) return <LoadingScreen />;
  if (!session) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function PublicLayout() {
  const { data: session, isPending } = useSession();
  if (isPending) return null;
  if (session) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <Outlet />
        <Toaster toastOptions={{ duration: 4500 }} />
      </>
    ),
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Navigate to="/login" replace /> },
      {
        element: <PublicLayout />,
        children: [
          { path: "login", element: <LoginPage /> },
          { path: "signup", element: <SignupPage /> },
        ],
      },
      {
        element: <ProtectedLayout />,
        children: [
          { path: "dashboard", element: <Dashboard /> },
          { path: "map", element: <MapPage /> },
        ],
      },
      { path: "*", element: <ErrorPage /> },
    ],
  },
]);

function App() {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

export default App;
