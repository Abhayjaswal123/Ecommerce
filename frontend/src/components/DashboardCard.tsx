
import {
  ArrowUpRight,
} from "lucide-react";

import type { ComponentType } from "react";
import { Link } from "react-router";

const PRIMARY_COLOR = "#4F35F5";

type DashboardCardProps = {
  title: string;
  description: string;
  icon: ComponentType<{ size?: number }>;
  to: string;
};

function DashboardCard({
  title,
  description,
  icon: Icon,
  to,
}: DashboardCardProps) {
  return (
    <Link
      to={to}
      className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100/50"
    >
      <span
        className="grid size-11 place-items-center rounded-xl transition-colors group-hover:bg-indigo-100"
        style={{
          backgroundColor: "#EFEDFF",
          color: PRIMARY_COLOR,
        }}
      >
        <Icon size={21} />
      </span>

      <h2 className="mt-5 text-base font-semibold text-slate-950">
        {title}
      </h2>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>

      <span
        className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium transition group-hover:gap-2.5"
        style={{ color: PRIMARY_COLOR }}
      >
        Open section
        <ArrowUpRight size={15} />
      </span>
    </Link>
  );
}

export default DashboardCard;
