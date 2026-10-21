import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import Sidebar from "./components/Sidebar.tsx";
import Home from "./pages/home.tsx";
import Login from "./pages/login.tsx";
import Register from "./pages/register.tsx";
import VendorProducts from "./pages/salerProduct.tsx";
import UserProducts from "./pages/userProductPage.tsx";

function AppLayout() {
  return (
    <div className="min-h-screen bg-[#171821] text-slate-100">
      <Sidebar />
      <main className="ml-64 min-h-screen bg-[#171821]">
        <Outlet />
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/register" replace />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/dashboard" element={<Home />} />
            <Route element={<ProtectedRoute allowedRoles={["vendor"]} />}>
              <Route path="/vendor-products" element={<VendorProducts />} />
            </Route>
            <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
              <Route path="/products" element={<UserProducts />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/register" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
