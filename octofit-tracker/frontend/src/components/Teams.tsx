import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Team = { name: string; members: unknown[] };

export default function Teams() {
  const [teams, setTeams] = useState<Team[]>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let active = true;
    getJson<{ teams: Team[] }>('/api/teams')
      .then(({ teams: result }) => {
        if (active) setTeams(result);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : 'Unable to load teams.');
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
        <h2 className="h4">Teams</h2>
        <p>Manage teams and members.</p>
        {loading && <p role="status">Loading teams...</p>}
        {error && <p role="alert">Unable to load teams: {error}</p>}
        {!loading && !error && teams?.length === 0 && <p role="status">No teams yet.</p>}
        {!loading && !error && teams && teams.length > 0 && (
          <ul>
            {teams.map((team) => (
              <li key={team.name}>{team.name} - {team.members.length} members</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
