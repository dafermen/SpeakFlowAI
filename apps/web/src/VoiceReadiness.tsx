/** Diagnóstico previo que evita solicitar el micrófono cuando la voz no funcionará. */

import { Button } from "@speakflow/design-system";
import {
  CheckCircle2,
  LoaderCircle,
  MicOff,
  RefreshCw,
  WifiOff,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { fetchWithBrowserContext } from "./realtimeClient";

export type VoiceReadinessStatus =
  | "api-unreachable"
  | "browser-unsupported"
  | "checking"
  | "offline"
  | "ready"
  | "voice-unavailable";

type ReadinessDependencies = {
  fetcher?: typeof fetch;
  microphoneSupported?: boolean;
  online?: boolean;
};

/**
 * Comprueba capacidades locales, red y configuración segura del backend.
 *
 * No solicita permiso ni abre el micrófono: esa acción permanece detrás del
 * botón explícito del alumno.
 */
export async function checkVoiceReadiness(
  apiBaseUrl: string,
  dependencies: ReadinessDependencies = {},
): Promise<VoiceReadinessStatus> {
  const microphoneSupported =
    dependencies.microphoneSupported ??
    Boolean(globalThis.navigator?.mediaDevices?.getUserMedia);
  if (!microphoneSupported) return "browser-unsupported";

  const online = dependencies.online ?? globalThis.navigator?.onLine !== false;
  if (!online) return "offline";

  try {
    const response = await fetchWithBrowserContext(
      dependencies.fetcher ?? globalThis.fetch,
      `${apiBaseUrl}/api/v1/realtime/readiness`,
      { headers: { Accept: "application/json" } },
    );
    if (!response.ok) return "api-unreachable";
    const payload = (await response.json()) as { available?: unknown };
    return payload.available === true ? "ready" : "voice-unavailable";
  } catch {
    return "api-unreachable";
  }
}

const readinessCopy: Record<
  Exclude<VoiceReadinessStatus, "checking">,
  { detail: string; title: string }
> = {
  ready: {
    title: "Todo listo para conversar",
    detail:
      "Al continuar, el navegador te pedirá permiso para usar el micrófono.",
  },
  "browser-unsupported": {
    title: "Este navegador no puede usar el micrófono aquí",
    detail:
      "Puedes abrir la aplicación en Chrome actualizado o usar la práctica escrita.",
  },
  offline: {
    title: "No hay conexión a internet",
    detail:
      "La práctica escrita sigue disponible mientras recuperas la conexión.",
  },
  "api-unreachable": {
    title: "No encontramos el servicio de voz",
    detail:
      "Tu configuración está guardada. Comprueba el servicio local y vuelve a intentarlo.",
  },
  "voice-unavailable": {
    title: "La conversación por voz no está disponible",
    detail:
      "Puedes continuar ahora con la práctica escrita sin perder tu configuración.",
  },
};

/** Muestra el resultado del diagnóstico y una recuperación apropiada. */
export function VoiceReadiness({
  apiBaseUrl,
  onFallback,
  onStart,
}: {
  apiBaseUrl: string;
  onFallback: () => void;
  onStart: () => void;
}) {
  const [status, setStatus] = useState<VoiceReadinessStatus>("checking");

  const runCheck = useCallback(async () => {
    setStatus("checking");
    setStatus(await checkVoiceReadiness(apiBaseUrl));
  }, [apiBaseUrl]);

  useEffect(() => {
    void runCheck();
  }, [runCheck]);

  if (status === "checking") {
    return (
      <div className="voice-readiness" role="status">
        <LoaderCircle aria-hidden="true" className="voice-readiness__spinner" />
        <div>
          <strong>Comprobando la conversación…</strong>
          <p>
            Revisamos el navegador y el servicio antes de pedir el micrófono.
          </p>
        </div>
      </div>
    );
  }

  const copy = readinessCopy[status];
  const ready = status === "ready";
  return (
    <div aria-live="polite" className="voice-readiness" role="status">
      {ready ? (
        <CheckCircle2 aria-hidden="true" className="voice-readiness__success" />
      ) : status === "browser-unsupported" ? (
        <MicOff aria-hidden="true" />
      ) : (
        <WifiOff aria-hidden="true" />
      )}
      <div>
        <strong>{copy.title}</strong>
        <p>{copy.detail}</p>
      </div>
      <div className="voice-readiness__actions">
        {ready ? (
          <Button onClick={onStart} size="large">
            Activar micrófono
          </Button>
        ) : (
          <>
            <Button onClick={() => void runCheck()} variant="secondary">
              <RefreshCw aria-hidden="true" size={17} />
              Comprobar otra vez
            </Button>
            <Button onClick={onFallback} variant="ghost">
              Usar práctica escrita
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
