/** Piezas de presentación compartidas por varias pantallas. */

import {
  CircleUserRound,
  House,
  MessageCircleMore,
  TrendingUp,
} from "lucide-react";

import type { View } from "./appTypes";

/** Par término/valor reutilizado en resúmenes de sesión y progreso. */
export function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

/** Navegación lateral/escritorio y barra inferior/móvil de las vistas principales. */
export function ProductNavigation({
  onNavigate,
  view,
}: {
  onNavigate: (view: View) => void;
  view: View;
}) {
  const navigation = [
    { label: "Inicio", icon: House, destination: "home" as const },
    {
      label: "Practicar",
      icon: MessageCircleMore,
      destination: "catalog" as const,
    },
    { label: "Progreso", icon: TrendingUp, destination: "progress" as const },
    {
      label: "Configuración",
      icon: CircleUserRound,
      destination: "settings" as const,
    },
  ];
  return (
    <nav aria-label="Navegación principal" className="product-navigation">
      <ul>
        {navigation.map(({ destination, icon: Icon, label }) => {
          const current =
            destination === view ||
            (destination === "catalog" &&
              ["setup", "session", "review"].includes(view));
          return (
            <li key={label}>
              <button
                aria-current={current ? "page" : undefined}
                className="product-navigation__item"
                disabled={destination === null}
                onClick={() => destination && onNavigate(destination)}
                type="button"
              >
                <Icon aria-hidden="true" size={21} strokeWidth={2} />
                <span>{label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
