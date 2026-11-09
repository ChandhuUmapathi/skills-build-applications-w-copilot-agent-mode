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
  return [];
}

export async function suggestWorkouts(_userEmail: string) {
  return Workout.find().limit(1).lean();
}

export { User };
