import clsx from 'clsx';
import { StatusBar } from 'expo-status-bar';
import { Text, ScrollView, TouchableOpacity, View, GestureResponderEvent } from 'react-native';
import { useEffect, useState } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';

import { useSessions } from './sessions';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const sessions = useSessions();
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [times, setTimes] = useState<string[]>([]);

  useEffect(() => {
    if (sessions.length > 0) {
      const ts = [...new Set(sessions.map(session => session.time))];
      setSelectedTime(ts[0]);
      setTimes(ts);
      SplashScreen.hideAsync();
    }
  }, [sessions]);

  const selectTime = (time: string) => {
    setSelectedTime(time);
  }

  if (sessions.length === 0) {
    return null;
  }

  const filteredSessions = sessions.filter(session => session.time === selectedTime);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />

      <SafeAreaView edges={['top']} className="flex-1 bg-slate-800 px-4">
        <ScrollView horizontal contentContainerStyle={{}} className="gap-4 flex-grow-0 pb-5">
          {times.map(time => (
            <TouchableOpacity key={time} onPress={() => selectTime(time)}>
              <View className={clsx('bg-slate-600 rounded-full px-4 h-7', {
                'bg-white': selectedTime === time,
              })}>
                <Text className={clsx('leading-7',
                  {
                    'text-slate-800': selectedTime === time,
                    'text-white': selectedTime !== time,
                  })}>
                  {time}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <ScrollView contentContainerStyle={{}} className="flex-1">
          {filteredSessions.map(session => (
            <View key={session.id} className="bg-white rounded-lg p-4 mb-5 shadow-md">
              <Text className="font-medium text-xl leading-none">{session.title}</Text>
              <Text className="text-sm text-muted-foreground">
                Speaker: {session.speaker}</Text>
              <Text className="text-sm text-muted-foreground">Room: {session.room}</Text>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}