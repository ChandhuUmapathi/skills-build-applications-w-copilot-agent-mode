import { useApiData } from '../api/useApiData.js';

type WorkoutSuggestion = { title: string; reason?: string };

export default function Workouts() {
  const userEmail = 'mona@example.com';
  const path = `/api/workouts/suggestions/${encodeURIComponent(userEmail)}`;
  const { data, loading, error } = useApiData<{ suggestions: WorkoutSuggestion[] }>(path);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">Workout suggestions</h2>
        <p>Recommend workouts from activity patterns.</p>
        {loading && <p role="status">Loading workout suggestions...</p>}
        {error && <p role="alert">Unable to load workout suggestions: {error}</p>}
        {!loading && !error && data?.suggestions.length === 0 && <p role="status">No workout suggestions yet.</p>}
        {!loading && !error && data && data.suggestions.length > 0 && (
          <ul>
            {data.suggestions.map((suggestion) => (
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
