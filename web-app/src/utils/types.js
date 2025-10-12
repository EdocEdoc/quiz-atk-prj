// User data model
export const createUser = (uid, username, avatarUrl = null) => ({
  uid,
  username,
  rating: 1000,
  avatarUrl,
  createdAt: new Date(),
});

// Room data model
export const createRoom = (hostId, hostTopic) => ({
  hostId,
  guestId: null,
  status: "waiting", // waiting, generating, lecture, battle, finished
  hostTopic,
  guestTopic: null,
  finalTopic: null,
  lecture: null,
  quizList: [],
  currentTurn: "host",
  currentAction: "attack", // attack or defend
  hp: { host: 10, guest: 10 },
  createdAt: new Date(),
});

// Quiz question model
export const createQuizQuestion = (question, choices, answerIndex) => ({
  question,
  choices,
  answerIndex,
  id: Math.random().toString(36).substr(2, 9),
});

// Match log model
export const createMatch = (roomId, winnerId, events = []) => ({
  roomId,
  winnerId,
  events,
  duration: 0,
  createdAt: new Date(),
});

// Game status constants
export const GAME_STATUS = {
  WAITING: "waiting",
  GENERATING: "generating",
  LECTURE: "lecture",
  BATTLE: "battle",
  FINISHED: "finished",
};

// Battle events
export const BATTLE_EVENTS = {
  ATTACK: "attack",
  DEFEND: "defend",
  DAMAGE: "damage",
  BLOCK: "block",
  WIN: "win",
  LOSE: "lose",
};
