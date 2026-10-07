import express from 'express';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';

initializeApp({
  projectId: 'demo-neon-snake'
});

const db = getFirestore();

const app = express();
const port = 3000;

type SessionResult = 'completed' | 'failed' | 'left';

interface GameplaySession {
  sessionId: string;
  level: number;
  startedAt: number;
  endedAt: number;
  result: SessionResult;
  score: number;
  progress: number;
  durationMs: number;
}

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const isGameplaySession = (
  value: unknown
): value is GameplaySession => {
  if (
    typeof value !== 'object' ||
    value === null
  ) {
    return false;
  }

  const session = value as Record<string, unknown>;

  return (
    typeof session.sessionId === 'string' &&
    session.sessionId.trim().length > 0 &&
    Number.isInteger(session.level) &&
    (session.level as number) > 0 &&
    isFiniteNumber(session.startedAt) &&
    isFiniteNumber(session.endedAt) &&
    session.endedAt >= session.startedAt &&
    (
      session.result === 'completed' ||
      session.result === 'failed' ||
      session.result === 'left'
    ) &&
    isFiniteNumber(session.score) &&
    session.score >= 0 &&
    isFiniteNumber(session.progress) &&
    session.progress >= 0 &&
    session.progress <= 1 &&
    isFiniteNumber(session.durationMs) &&
    session.durationMs >= 0
  );
};

app.use((_request, response, next) => {
  response.setHeader(
    'Access-Control-Allow-Origin',
    '*'
  );

  response.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS'
  );

  response.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type'
  );

  next();
});

app.use(express.json());

app.get('/health', (_request, response) => {
  response.json({
    status: 'ok'
  });
});

app.post('/analytics/sessions', async (request, response) => {
  try {
    if (!isGameplaySession(request.body)) {
      response.status(400).json({
        error: 'Invalid gameplay session'
      });

      return;
    }

    const session = request.body;

    await db
      .collection('gameplaySessions')
      .doc(session.sessionId)
      .set(session);

    response.status(201).json({
      success: true,
      sessionId: session.sessionId
    });
  } catch (error: unknown) {
    console.error(
      '[Analytics API] Failed to save session:',
      error
    );

    response.status(500).json({
      error: 'Failed to save gameplay session'
    });
  }
});

app.get('/analytics/sessions', async (_request, response) => {
  try {
    const snapshot = await db
      .collection('gameplaySessions')
      .orderBy('startedAt', 'desc')
      .get();

    const sessions = snapshot.docs.map((document) => ({
      ...document.data()
    })) as GameplaySession[];

    response.json({
      sessions
    });
  } catch (error: unknown) {
    console.error(
      '[Analytics API] Failed to load sessions:',
      error
    );

    response.status(500).json({
      error: 'Failed to load gameplay sessions'
    });
  }
});

app.listen(port, () => {
  console.log(
    `Analytics API running at http://localhost:${port}`
  );
});