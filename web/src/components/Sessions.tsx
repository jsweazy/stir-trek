'use client'
import { FC, useState } from "react";
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

  const filteredSessions = sessions.filter(session => session.time === selectedTime);

  return (
    <>
      <nav className="flex gap-4 pb-5 overflow-y-auto px-8">
        {times.map(t => (
          <button
            key={t}
            onClick={() => setSelectedTime(t)}
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
      <ul className="grid gap-5 grid-cols-[repeat(auto-fit,_minmax(min(100%,_max(320px,_100%/5)),_1fr))] px-8">
        {filteredSessions.map(session => (
          <li key={session.id} className="bg-white rounded-lg p-4 shadow-md">
            <h2 className="font-medium text-xl leading-none mb-2">{session.title}</h2>
            <p className="text-sm text-muted-foreground">Speaker: {session.speaker}</p>
            <p className="text-sm text-muted-foreground">Room: {session.room}</p>
          </li>
        ))}
      </ul>
    </>
  )
}