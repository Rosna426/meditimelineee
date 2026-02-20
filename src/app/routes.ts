import { createBrowserRouter } from "react-router";
import { AuthLayout } from "./layouts/AuthLayout";
import { AppLayout } from "./layouts/AppLayout";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { Dashboard } from "./pages/Dashboard";
import { NotFound } from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: AuthLayout,
    children: [
      { index: true, Component: Login },
      { path: "signup", Component: Signup },
    ],
  },
  {
    path: "/dashboard",
    Component: AppLayout,
    children: [
      { index: true, Component: Dashboard },
    ],
  },
  {
    path: "*",
    Component: NotFound,
  },
]);
