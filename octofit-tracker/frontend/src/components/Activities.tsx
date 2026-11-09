import { useApiData } from '../api/useApiData.js';

type Activity = { type: string; minutes: number; points: number };

export default function Activities() {
  const { data, loading, error } = useApiData<{ activities: Activity[] }>('/api/activities');

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">Activities</h2>
        <p>Track student activity minutes and points.</p>
        {loading && <p role="status">Loading activities...</p>}
        {error && <p role="alert">Unable to load activities: {error}</p>}
        {!loading && !error && data?.activities.length === 0 && <p role="status">No activities yet.</p>}
        {!loading && !error && data && data.activities.length > 0 && (
          <ul>
            {data.activities.map((activity, index) => (
              <li key={`${activity.type}-${index}`}>
                {activity.type} - {activity.minutes} minutes - {activity.points} points
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
