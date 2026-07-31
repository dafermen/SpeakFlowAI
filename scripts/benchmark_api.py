from __future__ import annotations

import statistics
import time

from fastapi.testclient import TestClient

from speakflow_api.main import app

REQUESTS = 500


def main() -> None:
    client = TestClient(app)
    samples: list[float] = []
    for _ in range(REQUESTS):
        started = time.perf_counter()
        response = client.get("/api/v1/health")
        samples.append((time.perf_counter() - started) * 1000)
        if response.status_code != 200:
            raise RuntimeError(f"Unexpected status: {response.status_code}")

    samples.sort()
    p95 = samples[int(len(samples) * 0.95) - 1]
    print(
        f"requests={len(samples)} "
        f"p50_ms={statistics.median(samples):.3f} "
        f"p95_ms={p95:.3f} max_ms={max(samples):.3f}"
    )


if __name__ == "__main__":
    main()
