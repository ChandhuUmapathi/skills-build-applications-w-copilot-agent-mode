import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Activity = { type: string; minutes: number; points: number };

export default function Activities() {
  const [activities, setActivities] = useState<Activity[]>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let active = true;
    getJson<{ activities: Activity[] }>('/api/activities')
      .then(({ activities: result }) => {
        if (active) setActivities(result);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : 'Unable to load activities.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">Activities</h2>
        <p>Track student activity minutes and points.</p>
        {loading && <p role="status">Loading activities...</p>}
        {error && <p role="alert">Unable to load activities: {error}</p>}
        {!loading && !error && activities?.length === 0 && <p role="status">No activities yet.</p>}
        {!loading && !error && activities && activities.length > 0 && (
          <ul>
            {activities.map((activity, index) => (
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
