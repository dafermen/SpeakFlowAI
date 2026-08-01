/** Conversación desplazable que mantiene visible el turno más reciente. */

import { ArrowDown } from "lucide-react";
import { useCallback, useLayoutEffect, useRef, useState } from "react";

/** Forma mínima que comparten los turnos de voz real y del tutor local. */
export type ConversationTranscriptTurn = {
  id: number | string;
  speaker: "learner" | "tutor";
  text: string;
};

const BOTTOM_TOLERANCE_PX = 48;

/**
 * Lista de turnos que sigue el final mientras la persona lee la conversación.
 *
 * Si la persona desplaza el contenido hacia arriba, el seguimiento se suspende
 * para no quitarle el texto que está leyendo. Un botón permite volver al turno
 * más reciente y reactivar el seguimiento automático.
 */
export function ConversationTranscript({
  emptyMessage,
  excludedTurnIds = new Set(),
  label,
  onToggleExclude,
  turns,
}: {
  emptyMessage?: string;
  excludedTurnIds?: ReadonlySet<number | string>;
  label: string;
  onToggleExclude?: (turnId: number | string) => void;
  turns: ConversationTranscriptTurn[];
}) {
  const listRef = useRef<HTMLOListElement>(null);
  const [followingLatest, setFollowingLatest] = useState(true);

  /** Desplaza inmediatamente al final y conserva compatibilidad con JSDOM. */
  const scrollToLatest = useCallback((behavior: ScrollBehavior = "auto") => {
    const list = listRef.current;
    if (!list) return;
    if (typeof list.scrollTo === "function") {
      list.scrollTo({ behavior, top: list.scrollHeight });
    } else {
      list.scrollTop = list.scrollHeight;
    }
  }, []);

  // Se ejecuta antes de pintar para que un turno nuevo no aparezca recortado.
  useLayoutEffect(() => {
    if (followingLatest) scrollToLatest();
  }, [followingLatest, scrollToLatest, turns]);

  /** Detecta si la persona sigue cerca del final o decidió leer hacia arriba. */
  const trackReadingPosition = () => {
    const list = listRef.current;
    if (!list) return;
    const distanceFromBottom =
      list.scrollHeight - list.scrollTop - list.clientHeight;
    setFollowingLatest(distanceFromBottom <= BOTTOM_TOLERANCE_PX);
  };

  /** Vuelve al turno más reciente mediante una acción explícita y accesible. */
  const resumeLatest = () => {
    setFollowingLatest(true);
    scrollToLatest("smooth");
  };

  return (
    <div className="transcript-shell">
      <ol
        aria-label={label}
        className="transcript"
        onScroll={trackReadingPosition}
        ref={listRef}
      >
        {turns.length === 0 && emptyMessage && (
          <li className="transcript__empty">{emptyMessage}</li>
        )}
        {turns.map((turn) => {
          const excluded = excludedTurnIds.has(turn.id);
          return (
            <li
              className={`turn turn--${turn.speaker}${excluded ? " turn--excluded" : ""}`}
              key={turn.id}
            >
              <strong>{turn.speaker === "tutor" ? "Tutor" : "Tú"}</strong>
              <span>{turn.text}</span>
              {turn.speaker === "learner" && onToggleExclude && (
                <button
                  aria-pressed={excluded}
                  className="turn__review-toggle"
                  onClick={() => onToggleExclude(turn.id)}
                  type="button"
                >
                  {excluded
                    ? "Volver a incluir en mi revisión"
                    : "Esto no fue lo que dije"}
                </button>
              )}
            </li>
          );
        })}
      </ol>
      {!followingLatest && turns.length > 0 && (
        <button
          className="transcript__latest"
          onClick={resumeLatest}
          type="button"
        >
          <ArrowDown aria-hidden="true" size={16} />
          Volver al final
        </button>
      )}
    </div>
  );
}
