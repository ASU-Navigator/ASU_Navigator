import "./App.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
//import { AuthProvider } from "./contexts/auth"; // This will be added later.
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ErrorPage from "./pages/ErrorPage";
import Home from "./pages/Home";

function Layout() {
  return (
    <>
    <Outlet />
    <Toaster
      toastOptions={{
        duration: 4500,
      }}
    />
    </>
  );
}

function App() {
  const queryClient = new QueryClient();

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      errorElement: <ErrorPage />,
      children: [
        {
          index: true,
          element: <Home />,
        },
        { path: "*", element: <ErrorPage /> },
      ],
    },
  ]);

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </>
  );
}

export default App;
