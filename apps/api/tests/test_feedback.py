from speakflow_api.application.feedback import generate_feedback
from speakflow_api.domain.practice_session import SessionTurn


def test_feedback_finds_a_teachable_correction() -> None:
    feedback = generate_feedback(
        "scenario.daily.coffee-shop",
        (SessionTurn("learner", "I want a coffee, please.", 0),),
    )

    assert feedback.corrections[0].improved == "I'd like"
    assert feedback.vocabulary[0].term == "decaf"
    assert feedback.improved_phrases


def test_feedback_handles_a_session_without_learner_turns() -> None:
    feedback = generate_feedback("scenario.daily.coffee-shop", ())

    assert "terminó" in feedback.summary
    assert feedback.observations[0].category == "next_step"
