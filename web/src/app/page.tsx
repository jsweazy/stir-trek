import { Sessions } from "@/components/Sessions";
import { Session, getSessions } from "@/helpers/sessions";

export default async function Home() {
  let sessions: Session[] = []
  try {
    sessions = await getSessions();
  } catch (err) {
    console.error(err);
  }

  const times = [...new Set(sessions.map(session => session.time))];

  return (
    <Sessions times={times} sessions={sessions} />
  );
}
