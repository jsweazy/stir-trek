import sqlite3 from 'sqlite3';

export type Session = {
  id: number;
  title: string;
  time: string;
  speaker: string;
  room: string;
};

export const getSessions = async (): Promise<Session[]> => {
  return new Promise((resolve, reject) => {
    sqlite3.verbose();
    const db = new sqlite3.Database('./sessions.db');
    db.all('SELECT * FROM sessions', (err: unknown, rows: Session[]) => {
      if (err) {
        reject(err);
      }
      resolve(rows);
    });
  });
}