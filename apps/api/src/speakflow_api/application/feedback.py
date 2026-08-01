"""Genera feedback pedagógico local, determinista y fácil de probar.

Este servicio no llama a modelos de IA. Aplica reglas explícitas sobre los turnos
del alumno para que el MVP conserve una revisión útil aun sin conexión.
"""

from __future__ import annotations

import re

from speakflow_api.domain.practice_session import (
    FeedbackCorrection,
    FeedbackObservation,
    SessionFeedback,
    SessionTurn,
    VocabularyItem,
)

# Vocabulario sugerido por escenario para enriquecer la revisión final.
SCENARIO_VOCABULARY = {
    "scenario.daily.coffee-shop": (
        VocabularyItem("decaf", "descafeinado", "Could I have a decaf latte?"),
        VocabularyItem("to go", "para llevar", "Can I get that to go?"),
    ),
    "scenario.workplace.daily-standup": (
        VocabularyItem("blocker", "bloqueo", "I have one blocker today."),
        VocabularyItem("on track", "según lo previsto", "The task is on track."),
    ),
    "scenario.it-support.printer-offline": (
        VocabularyItem("queue", "cola de impresión", "Please clear the print queue."),
        VocabularyItem("reconnect", "volver a conectar", "Reconnect the printer to Wi-Fi."),
    ),
    "scenario.interview.backend-role": (
        VocabularyItem("trade-off", "compensación", "The main trade-off was latency."),
        VocabularyItem("throughput", "rendimiento", "We doubled the system throughput."),
    ),
}


def _corrections(learner_text: str) -> tuple[FeedbackCorrection, ...]:
    """Detecta hasta tres patrones frecuentes y construye correcciones explicadas.

    Args:
        learner_text: Intervenciones del alumno concatenadas en orden.

    Returns:
        Tupla inmutable de correcciones; queda vacía si ninguna regla coincide.
    """

    rules = (
        (
            r"\bI want\b",
            "I'd like",
            "‘I'd like’ suena más cortés y natural al hacer una petición.",
        ),
        (
            r"\byesterday I complete\b",
            "yesterday I completed",
            "Usa pasado simple para una acción terminada ayer.",
        ),
        (
            r"\bI am agree\b",
            "I agree",
            "‘Agree’ funciona como verbo y no necesita ‘am’.",
        ),
    )
    found: list[FeedbackCorrection] = []
    for pattern, replacement, explanation in rules:
        match = re.search(pattern, learner_text, flags=re.IGNORECASE)
        if match:
            found.append(
                FeedbackCorrection(
                    original=match.group(0),
                    improved=replacement,
                    explanation=explanation,
                )
            )
    return tuple(found[:3])


def generate_feedback(
    scenario_id: str,
    turns: tuple[SessionTurn, ...],
) -> SessionFeedback:
    """Resume una conversación y propone una fortaleza y un siguiente paso.

    Args:
        scenario_id: Identificador usado para seleccionar vocabulario contextual.
        turns: Turnos ordenados de tutor y alumno; solo estos últimos se evalúan.

    Returns:
        Feedback determinista listo para persistir y presentar en la interfaz.

    La función tiene una salida específica para sesiones sin intervenciones y no
    modifica los turnos recibidos.
    """

    learner_turns = [turn.text.strip() for turn in turns if turn.speaker == "learner"]
    learner_text = " ".join(text for text in learner_turns if text)
    word_count = len(learner_text.split())
    corrections = _corrections(learner_text)

    if not learner_turns:
        return SessionFeedback(
            summary="La sesión terminó antes de registrar una intervención completa.",
            strength="Abriste el espacio de práctica y preparaste el escenario.",
            focus_area="En la próxima sesión, intenta responder al menos dos preguntas completas.",
            vocabulary=SCENARIO_VOCABULARY.get(scenario_id, ())[:1],
            observations=(
                FeedbackObservation("next_step", "Completa dos turnos breves en voz alta."),
            ),
        )

    strength = (
        "Sostuviste la conversación con respuestas completas y fáciles de seguir."
        if word_count >= 20
        else "Respondiste de forma directa y mantuviste el intercambio en movimiento."
    )
    focus_area = (
        "Practica conectar ideas con ‘because’, ‘so’ y ‘then’ para ganar fluidez."
        if not corrections
        else "Repite las frases corregidas una vez más, cuidando el patrón señalado."
    )
    improved_phrases = tuple(
        phrase
        for phrase in (
            "Could you please clarify that?",
            "Let me explain that in another way.",
            learner_turns[-1] if learner_turns else "",
        )
        if phrase
    )[:3]
    return SessionFeedback(
        summary=(
            f"Completaste {len(learner_turns)} intervenciones y practicaste "
            "una conversación enfocada."
        ),
        strength=strength,
        focus_area=focus_area,
        corrections=corrections,
        vocabulary=SCENARIO_VOCABULARY.get(scenario_id, ())[:3],
        improved_phrases=improved_phrases,
        observations=(
            FeedbackObservation(
                "fluency",
                f"Produjiste aproximadamente {word_count} palabras durante la práctica.",
            ),
            FeedbackObservation("next_step", focus_area),
        ),
    )
