import { lazy } from "react";
import { createBrowserRouter } from "react-router";

const Root = lazy(() => import("./pages/root"));
const Dashboard = lazy(() => import("./pages/dashboard"));
const EnterpriseDashboard = lazy(() => import("./pages/enterpriseDashboard"));
const Subscriptions = lazy(() => import("./pages/subscriptions"));
const Billing = lazy(() => import("./pages/billing"));
const SharedSubscriptions = lazy(() => import("./pages/sharedSubscriptions"));
const Analytics = lazy(() => import("./pages/analytics"));
const AdminPanel = lazy(() => import("./pages/adminPanel"));
const Settings = lazy(() => import("./pages/settings"));
const Login = lazy(() => import("./pages/login"));
const Register = lazy(() => import("./pages/register"));
const ProductsServices = lazy(() => import("./pages/productsServices"));
const EnterpriseServices = lazy(() => import("./pages/enterpriseServices"));

const ForgotPassword = lazy(() => import("./pages/forgotPassword"));
const UserManagement = lazy(() => import("./pages/userManagement"));

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
      { path: "user-management", Component: UserManagement },
      { path: "enterprise-management", Component: UserManagement },
      { path: "admin", Component: AdminPanel },
      { path: "settings", Component: Settings },
    ],
  },
]);