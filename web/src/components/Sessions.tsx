'use client'
import { FC, useRef, useState } from "react";
import clsx from 'clsx';
import { Session } from "@/helpers/sessions";

type SessionProps = {
  sessions: Session[];
  times: string[];
};
export const Sessions: FC<SessionProps> = ({
  sessions,
  times
}) => {
  const [selectedTime, setSelectedTime] = useState<string>(times[0]);
  const sessionsListRef = useRef<HTMLUListElement>(null);

  const filteredSessions = sessions.filter(session => session.time === selectedTime);

  const setTime = (time: string, e: React.MouseEvent<HTMLButtonElement>) => {
    setSelectedTime(time);
    sessionsListRef.current?.scrollTo(0, 0);
    e.currentTarget.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <main className="flex md:flex-col flex-col-reverse h-svh overflow-hidden">
      <nav className="flex gap-4 py-5 overflow-y-auto px-8 flex-shrink-0 shadow-md md:shadow-none">
        {times.map(t => (
          <button
            key={t}
            onClick={(e) => setTime(t, e)}
            className={clsx(
              "bg-slate-600 rounded-full px-4 h-7 shrink-0",
              {
                "bg-white": selectedTime === t,
                "text-white": selectedTime !== t,
              }
            )}
          >
            {t}
          </button>
        ))}
      </nav>
      <ul className={clsx(
        'grid gap-5 grid-cols-[repeat(auto-fit,_minmax(min(100%,_max(320px,_100%/5)),_1fr))] px-8 flex-1 overflow-x-auto',
        'pt-8 md:pt-0 pb-0 md:pb-8'
      )} ref={sessionsListRef}>
        {filteredSessions.map(session => (
          <li key={session.id} className="bg-white rounded-lg p-4 shadow-md">
            <h2 className="font-medium text-xl mb-2">{session.title}</h2>
            <p className="text-sm text-muted-foreground">Speaker: {session.speaker}</p>
            <p className="text-sm text-muted-foreground">Room: {session.room}</p>
          </li>
        ))}
      </ul>
    </main>
  )
}