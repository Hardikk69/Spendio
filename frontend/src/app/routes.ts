import { lazy } from "react";
import { createBrowserRouter } from "react-router";

const Root = lazy(() => import("./pages/Root"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const EnterpriseDashboard = lazy(() => import("./pages/EnterpriseDashboard"));
const Subscriptions = lazy(() => import("./pages/Subscriptions"));
const Billing = lazy(() => import("./pages/Billing"));
const SharedSubscriptions = lazy(() => import("./pages/SharedSubscriptions"));
const Analytics = lazy(() => import("./pages/Analytics"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const Settings = lazy(() => import("./pages/Settings"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ProductsServices = lazy(() => import("./pages/ProductsServices"));
const EnterpriseServices = lazy(() => import("./pages/EnterpriseServices"));

const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/forgot-password",
    Component: ForgotPassword,
  },
  {
    path: "/register",
    Component: Register,
  },
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Dashboard },
      { path: "enterprise", Component: EnterpriseDashboard },
      { path: "enterprise/services", Component: EnterpriseServices },
      { path: "products", Component: ProductsServices },
      { path: "subscriptions", Component: Subscriptions },
      { path: "billing", Component: Billing },
      { path: "shared", Component: SharedSubscriptions },
      { path: "analytics", Component: Analytics },
      { path: "user-management", Component: Analytics },
      { path: "enterprise-management", Component: Analytics },
      { path: "admin", Component: AdminPanel },
      { path: "settings", Component: Settings },
    ],
  },
]);