import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type WorkoutSuggestion = { title: string; reason?: string };

export default function Workouts() {
  const userEmail = 'mona@example.com';
  const path = `/api/workouts/suggestions/${encodeURIComponent(userEmail)}`;
  const [suggestions, setSuggestions] = useState<WorkoutSuggestion[]>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let active = true;
    getJson<{ suggestions: WorkoutSuggestion[] }>(path)
      .then(({ suggestions: result }) => {
        if (active) setSuggestions(result);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : 'Unable to load workout suggestions.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [path]);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">Workout suggestions</h2>
        <p>Recommend workouts from activity patterns.</p>
        {loading && <p role="status">Loading workout suggestions...</p>}
        {error && <p role="alert">Unable to load workout suggestions: {error}</p>}
        {!loading && !error && suggestions?.length === 0 && <p role="status">No workout suggestions yet.</p>}
        {!loading && !error && suggestions && suggestions.length > 0 && (
          <ul>
            {suggestions.map((suggestion) => (
              <li key={suggestion.title}>
                <strong>{suggestion.title}</strong>
                {suggestion.reason && <p>{suggestion.reason}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
