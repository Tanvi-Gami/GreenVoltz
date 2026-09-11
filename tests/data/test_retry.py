"""Tests for the retry decorator."""

import pytest

from data_pipeline.collectors.retry import retry


def test_retry_success():
    calls = []

    def func():
        calls.append(1)
        return "ok"

    decorated = retry(max_retries=2, base_delay=0.01)(func)
    assert decorated() == "ok"
    assert len(calls) == 1


def test_retry_recovers():
    """Function fails once then succeeds — retry should recover."""
    attempt = {"n": 0}

    def func():
        attempt["n"] += 1
        if attempt["n"] < 2:
            raise ValueError("fail")
        return "recovered"

    decorated = retry(exceptions=ValueError, max_retries=2, base_delay=0.01)(func)
    result = decorated()
    assert result == "recovered"
    assert attempt["n"] == 2


def test_retry_exhaustion():
    """Function always fails — retry should re-raise after max attempts."""
    calls = []

    def func():
        calls.append(1)
        raise ValueError("persistent")

    decorated = retry(exceptions=ValueError, max_retries=2, base_delay=0.01)(func)
    with pytest.raises(ValueError, match="persistent"):
        decorated()
    assert len(calls) == 3  # initial + 2 retries
