import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import { RequireAuth } from "./lib/auth";
import MenuBoard from "./pages/MenuBoard";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Order from "./pages/Order";
import Queue from "./pages/Queue";
import Dashboard from "./pages/Dashboard";
import Menu from "./pages/Menu";
import History from "./pages/History";

export default function App() {
  // Vite injects BASE_URL ("/OrderApp/" in the Pages build, "/" in dev). Strip
  // the trailing slash so react-router serves every route under the subpath.
  const basename = import.meta.env.BASE_URL.replace(/\/$/, "");
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        {/* Public, no-auth storefront */}
        <Route path="/" element={<MenuBoard />} />
        <Route path="/login" element={<Login />} />

        {/* Staff back-of-house app, behind the crew passcode */}
        <Route
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          <Route path="/app" element={<Home />} />
          <Route path="/app/order" element={<Order />} />
          <Route path="/app/queue" element={<Queue />} />
          <Route path="/app/dashboard" element={<Dashboard />} />
          <Route path="/app/history" element={<History />} />
          <Route path="/app/menu" element={<Menu />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
