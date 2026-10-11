import { ArrowUpRight, LogOut, ShoppingBag, Sparkles } from "lucide-react";
import { Link } from "react-router";
import {logout} from  "../api/api";
import { useNavigate } from "react-router";

function Home() {

  const navigate = useNavigate();

const logoutUser = async () => {
  try {
    await logout();
    navigate("/");
  } catch (error) {
    console.error("Logout API failed:", error);
  } finally {
    localStorage.removeItem("user");
  }
};

const user = JSON.parse(localStorage.getItem("user") || "null");

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link to="/home" className="flex items-center gap-2.5" aria-label="CreateSpace home">
            <span className="grid size-9 place-items-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-200">
              <ShoppingBag size={18} aria-hidden="true" />
            </span>
            <span className="text-base font-semibold tracking-tight">CreateSpace</span>
          </Link>

          <button
            onClick={() => logoutUser()}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            type="button"
          >
            <LogOut size={16} aria-hidden="true" />
            Log out
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <section className="relative overflow-hidden rounded-3xl bg-indigo-600 px-6 py-10 text-white shadow-[0_18px_45px_rgba(79,70,229,0.18)] sm:px-10 sm:py-14">
          <div className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full border-[35px] border-white/10" />
          <div className="pointer-events-none absolute -bottom-36 right-[20%] size-64 rounded-full bg-indigo-500/70" />
          <div className="relative max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-indigo-50">
              <Sparkles size={14} aria-hidden="true" />
              Your personal space
            </div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Hello, {user?.username} <span aria-hidden="true">👋</span>
            </h1>
            <p className="mt-3 max-w-lg text-sm leading-6 text-indigo-100 sm:text-base">
              Welcome back to your dashboard. We&apos;re glad you&apos;re here—your next great idea starts today.
            </p>
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <span className="grid size-11 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
              <ShoppingBag size={20} aria-hidden="true" />
            </span>
            <h2 className="mt-5 text-lg font-semibold tracking-tight">Your dashboard</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              This is your space to explore and keep track of what matters to you.
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <span className="grid size-11 place-items-center rounded-xl bg-violet-50 text-violet-600">
              <Sparkles size={20} aria-hidden="true" />
            </span>
            <h2 className="mt-5 text-lg font-semibold tracking-tight">Ready to get started?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Your account is ready. Check back soon for more things to discover.
            </p>
            <Link
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700"
              to="/"
            >
              Explore CreateSpace <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </article>
        </section>
      </div>
    </main>
  );
}

export default Home;
