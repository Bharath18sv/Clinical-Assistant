import { LucideIcon } from "lucide-react";

const colorClasses = {
  blue: "icon-blue",
  green: "icon-green", 
  purple: "icon-purple",
  orange: "icon-orange",
  red: "icon-red",
};

export default function HealthCard({
  icon: Icon,
  title,
  value,
  color,
  subtitle,
}) {
  return (
    <div className="card">
      <div className="flex items-center">
        <div className={`icon-container ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}
