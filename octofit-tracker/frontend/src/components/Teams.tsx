import { useApiData } from '../api/useApiData.js';

type Team = { name: string; members: unknown[] };

export default function Teams() {
  const { data, loading, error } = useApiData<{ teams: Team[] }>('/api/teams');

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">Teams</h2>
        <p>Manage teams and members.</p>
        {loading && <p role="status">Loading teams...</p>}
        {error && <p role="alert">Unable to load teams: {error}</p>}
        {!loading && !error && data?.teams.length === 0 && <p role="status">No teams yet.</p>}
        {!loading && !error && data && data.teams.length > 0 && (
          <ul>
            {data.teams.map((team) => (
              <li key={team.name}>{team.name} - {team.members.length} members</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
