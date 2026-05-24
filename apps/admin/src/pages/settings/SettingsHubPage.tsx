import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { settingsNavItems } from "@/config/settingsNav";

const hubItems = settingsNavItems.filter((item) => !item.end);

export default function SettingsHubPage() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {hubItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            className="group rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Icon className="h-5 w-5" />
              </div>
              <ChevronLeft className="h-4 w-4 text-muted-foreground rotate-180 group-hover:text-primary transition-colors mt-1" />
            </div>
            <h3 className="font-bold mt-4">{item.label}</h3>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{item.description}</p>
          </Link>
        );
      })}
    </div>
  );
}
