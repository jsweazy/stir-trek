import * as FileSystem from 'expo-file-system';
import * as SQLite from 'expo-sqlite';
import { Asset } from 'expo-asset';
import { useEffect, useState } from 'react';

export type Session = {
  id: number;
  title: string;
  time: string;
  speaker: string;
  room: string;
};

const DB_NAME = 'sessions.db';

const getDatabase = async () => {
  try {
    if (!(await FileSystem.getInfoAsync(FileSystem.documentDirectory + 'SQLite')).exists) {
      await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'SQLite');
    }
    const asset = await Asset.fromModule(require(`./${DB_NAME}`)).downloadAsync();
    if (!asset.localUri) {
      console.error('Failed to download asset');
      return null;
    }
    await FileSystem.copyAsync({
      from: asset.localUri,
      to: `${FileSystem.documentDirectory}SQLite/${DB_NAME}`,
    });
    return SQLite.openDatabase(DB_NAME);
  } catch (e) {
    console.error(e);
    return null
  }
}

const getSessions = async () => {
  let sessions: Session[] = [];
  const db = await getDatabase();

  if (!db) {
    return sessions;
  }

  await db.transactionAsync(async tx => {
    const result = await tx.executeSqlAsync('SELECT * FROM sessions', []);
    sessions = result.rows as Session[];
  }, true);

  return sessions;
}

export const useSessions = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  useEffect(() => {
    (async () => {
      const sessions = await getSessions();
      setSessions(sessions);
    })();
  }, []);
  return sessions;
}