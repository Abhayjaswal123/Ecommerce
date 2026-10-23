import {
  LogOut,
  ShoppingBag,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
} from "lucide-react";

import { Link, NavLink, useNavigate } from "react-router";
import { logout } from "../api/api";
import { getProductsPath, getStoredUser } from "../utils/authStorage";
import { useAuth } from "../context/Authcontext";

const PRIMARY_COLOR = "#4F35F5";

function Sidebar() {
  const navigate = useNavigate();
  const { user: authUser, setUser } = useAuth();

  // Use the latest authenticated user
  const user = authUser || getStoredUser();
  const role = user?.role?.toLowerCase() || "";

const navItems = [
  ...(role === "vendor"
    ? [{ name: "Dashboard", path: "/home", icon: LayoutDashboard }]
    : []),
  {
    name: "Products",
    path: getProductsPath(user?.role),
    icon: Package,
  },
  ...(role === "user"
    ? [{ name: "Cart", path: "/cart", icon: ShoppingCart }]
    : []),
  { name: "Orders", path: "/orders", icon: ShoppingCart },
  { name: "Delivered", path: "/delivered", icon: Truck },
];
  const logoutUser = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout API failed:", error);
    } finally {
      setUser(null);
      localStorage.removeItem("user");
      navigate("/", { replace: true });
    }
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-64 flex-col bg-slate-950 p-5 text-white">
      <Link to={getProductsPath(user?.role)} className="mb-10 flex items-center gap-3">
        <span
          className="grid size-10 place-items-center rounded-xl text-white"
          style={{ backgroundColor: PRIMARY_COLOR }}
        >
          <ShoppingBag size={21} />
        </span>

        <span>
          <span className="block text-lg font-bold tracking-tight">
            CreateSpace
          </span>
          <span className="text-xs text-slate-400">
            {role === "vendor" ? "Seller Dashboard" : "User Dashboard"}
          </span>
        </span>
      </Link>

      <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
        Menu
      </p>

      <nav className="flex flex-col gap-2">
        {navItems.map(({ name, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/home"}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "text-white shadow-lg shadow-indigo-950/30"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`
            }
            style={({ isActive }) =>
              isActive ? { backgroundColor: PRIMARY_COLOR } : undefined
            }
          >
            <Icon size={19} />
            <span>{name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto border-t border-slate-800 pt-4">
        <div className="mb-4 flex items-center gap-3 px-2">
          <div
            className="grid size-10 shrink-0 place-items-center rounded-full font-semibold text-indigo-300"
            style={{ backgroundColor: "rgba(79, 53, 245, 0.2)" }}
          >
            {user?.username?.charAt(0)?.toUpperCase() || "U"}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {user?.username || "User"}
            </p>
            <p className="text-xs text-slate-400">
              {role === "vendor" ? "Vendor account" : "User account"}
            </p>
          </div>
        </div>

        <button
          onClick={logoutUser}
          type="button"
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut size={19} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;