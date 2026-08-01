/** Acciones pequeñas para reutilizar y escuchar frases obtenidas en la revisión. */

import { Check, Copy, Volume2 } from "lucide-react";
import { useState } from "react";

/** Lista de frases con copia al portapapeles y pronunciación local del navegador. */
export function LearningPhraseList({ phrases }: { phrases: string[] }) {
  const [copiedPhrase, setCopiedPhrase] = useState<string | null>(null);
  const canCopy = Boolean(globalThis.navigator?.clipboard?.writeText);
  const canSpeak = Boolean(
    globalThis.speechSynthesis && globalThis.SpeechSynthesisUtterance,
  );

  /** Copia una frase y confirma la acción sin interrumpir la lectura. */
  const copyPhrase = async (phrase: string) => {
    if (!canCopy) return;
    await globalThis.navigator.clipboard.writeText(phrase);
    setCopiedPhrase(phrase);
  };

  /** Pronuncia únicamente la frase elegida mediante síntesis local. */
  const speakPhrase = (phrase: string) => {
    if (!canSpeak) return;
    globalThis.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(phrase);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    globalThis.speechSynthesis.speak(utterance);
  };

  return (
    <ul className="review__phrases">
      {phrases.map((phrase) => (
        <li key={phrase}>
          <span>{phrase}</span>
          <div className="review__phrase-actions">
            <button
              aria-label={`Escuchar: ${phrase}`}
              disabled={!canSpeak}
              onClick={() => speakPhrase(phrase)}
              title={canSpeak ? undefined : "La voz local no está disponible"}
              type="button"
            >
              <Volume2 aria-hidden="true" size={16} />
              Escuchar
            </button>
            <button
              aria-label={`Copiar: ${phrase}`}
              disabled={!canCopy}
              onClick={() => void copyPhrase(phrase)}
              title={canCopy ? undefined : "El portapapeles no está disponible"}
              type="button"
            >
              {copiedPhrase === phrase ? (
                <Check aria-hidden="true" size={16} />
              ) : (
                <Copy aria-hidden="true" size={16} />
              )}
              {copiedPhrase === phrase ? "Copiada" : "Copiar"}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
