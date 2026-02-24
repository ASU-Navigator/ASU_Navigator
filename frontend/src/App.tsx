import "./App.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { trpc, trpcClient } from "./utils/trpc/client";
import { AuthProvider } from "./contexts/auth";
import ErrorPage from "./pages/ErrorPage";
import Home from "./pages/Home";

const queryClient = new QueryClient();

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
      { index: true, element: <Home /> },
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
