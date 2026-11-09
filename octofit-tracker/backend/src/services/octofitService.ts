import { Activity, Team, User, Workout } from '../models/index.js';
import { isObjectIdOrHexString, Types } from 'mongoose';

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw Object.assign(new Error('Activity details are required'), { status: 400 });
  }

  const { userId, teamId, type, minutes } = input as Record<string, unknown>;
  if (
    typeof userId !== 'string' || !isObjectIdOrHexString(userId) ||
    typeof teamId !== 'string' || !isObjectIdOrHexString(teamId) ||
    typeof type !== 'string' || !type.trim() ||
    typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes <= 0
  ) {
    throw Object.assign(new Error('Valid userId, teamId, type, and positive minutes are required'), { status: 400 });
  }

  const userObjectId = new Types.ObjectId(userId);
  const teamObjectId = new Types.ObjectId(teamId);
  const [userExists, teamExists] = await Promise.all([
    User.exists({ _id: userObjectId }),
    Team.exists({ _id: teamObjectId }),
  ]);
  if (!userExists || !teamExists) {
    throw Object.assign(new Error('The specified user or team does not exist'), { status: 404 });
  }

  return Activity.create({
    user: userObjectId,
    team: teamObjectId,
    type,
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw Object.assign(new Error('Team details are required'), { status: 400 });
  }

  const { name, mascot, members } = input as Record<string, unknown>;
  if (typeof name !== 'string' || !name.trim()) {
    throw Object.assign(new Error('A team name is required'), { status: 400 });
  }
  if (typeof mascot !== 'string' || !mascot.trim()) {
    throw Object.assign(new Error('A team mascot is required'), { status: 400 });
  }
  if (members !== undefined && (!Array.isArray(members) || !members.every(isObjectIdOrHexString))) {
    throw Object.assign(new Error('Team members must be valid user IDs'), { status: 400 });
  }

  return Team.create({
    name,
    mascot,
    ...(members === undefined ? {} : { members: members.map((member) => new Types.ObjectId(member.toString())) }),
  });
}

export async function getLeaderboard() {
  const [teams, totals] = await Promise.all([
    Team.find().lean(),
    Activity.aggregate([
      { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    ]),
  ]);
  const pointsByTeam = new Map(totals.map(({ _id, totalPoints }) => [_id.toString(), totalPoints]));
  return teams
    .map((team) => ({ teamName: team.name, totalPoints: pointsByTeam.get(team._id.toString()) ?? 0 }))
    .sort((left, right) => right.totalPoints - left.totalPoints || left.teamName.localeCompare(right.teamName))
    .map((team, index) => ({ ...team, rank: index + 1 }));
}

function normalizeFocus(value: string) {
  const normalized = value.trim().toLowerCase();
  if (['run', 'running', 'cycle', 'cycling', 'walk', 'walking', 'cardio'].includes(normalized)) return 'endurance';
  if (['lift', 'lifting', 'weights'].includes(normalized)) return 'strength';
  return normalized;
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail }).lean();
  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }

  const [recentActivity, workouts] = await Promise.all([
    Activity.findOne({ user: user._id }).sort({ occurredAt: -1, _id: -1 }).lean(),
    Workout.find().lean(),
  ]);
  const goalFocus = normalizeFocus(user.fitnessGoal);
  const activityFocus = recentActivity ? normalizeFocus(recentActivity.type) : undefined;

  return workouts
    .map((workout) => {
      const focus = normalizeFocus(workout.focus);
      const matchesGoal = focus === goalFocus;
      const matchesActivity = activityFocus !== undefined && focus === activityFocus;
      return { workout, matchesGoal, matchesActivity };
    })
    .filter(({ matchesGoal, matchesActivity }) => matchesGoal || matchesActivity)
    .sort((left, right) => Number(right.matchesGoal) - Number(left.matchesGoal))
    .map(({ workout, matchesGoal, matchesActivity }) => {
      const reason = matchesGoal && matchesActivity
        ? `This workout matches your ${user.fitnessGoal} goal and recent ${recentActivity?.type} activity.`
        : matchesGoal
          ? `This workout matches your ${user.fitnessGoal} fitness goal.`
          : `This workout complements your recent ${recentActivity?.type} activity.`;
      return { ...workout, reason };
    });
}

export { User };
