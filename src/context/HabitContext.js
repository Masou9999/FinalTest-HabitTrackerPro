import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

export const HabitContext = createContext();

export const HabitProvider = ({ children }) => {
  const [habits, setHabits] = useState([]);

  // Load data on startup
  useEffect(() => {
    loadHabits();
    setupNotifications();
  }, []);

  const loadHabits = async () => {
    const stored = await AsyncStorage.getItem('habits');
    if (stored) setHabits(JSON.parse(stored));
  };

  const saveHabits = async (newHabits) => {
    setHabits(newHabits);
    await AsyncStorage.setItem('habits', JSON.stringify(newHabits));
  };

  // FR-1: Create Habits [cite: 5]
  const addHabit = (habit) => {
    const newHabit = {
      id: Date.now().toString(),
      completedDates: {}, // Map of dates "YYYY-MM-DD": true
      streak: 0,
      longestStreak: 0,
      totalCompleted: 0,
      ...habit,
    };
    saveHabits([...habits, newHabit]);
  };

  // FR-2: Delete Habits [cite: 17]
  const deleteHabit = (id) => {
    saveHabits(habits.filter((h) => h.id !== id));
  };

  const updateHabit = (id, updatedFields) => {
    const updatedHabits = habits.map((habit) => {
      if (habit.id === id) {
        return { ...habit, ...updatedFields };
      }
      return habit;
    });
    saveHabits(updatedHabits);
  };

  // FR-4: Mark Habit as Completed 
  // FR-6: Streak Tracking [cite: 35]
  const toggleHabitCompletion = (id) => {
    const today = new Date().toISOString().split('T')[0];
    
    const updatedHabits = habits.map((h) => {
      if (h.id === id) {
        const isCompleted = !!h.completedDates[today];
        const newDates = { ...h.completedDates };
        
        if (isCompleted) {
          delete newDates[today];
        } else {
          newDates[today] = true;
        }

        // Recalculate streaks (Simplified logic for demo)
        const datesArr = Object.keys(newDates).sort();
        let currentStreak = 0;
        let longest = h.longestStreak;
        // Logic to calculate streak would go here (checking consecutive days)
        // For now, we increment if added today
        if (!isCompleted) currentStreak = h.streak + 1;
        else currentStreak = Math.max(0, h.streak - 1);

        return {
          ...h,
          completedDates: newDates,
          streak: currentStreak,
          longestStreak: Math.max(longest, currentStreak),
          totalCompleted: Object.keys(newDates).length
        };
      }
      return h;
    });
    saveHabits(updatedHabits);
  };

  // FR-7 & FR-8: Notifications [cite: 41, 45]
  const setupNotifications = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status === 'granted') {
      // Smart Reminder: Schedule daily at 8 PM
      await Notifications.cancelAllScheduledNotificationsAsync();
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "HabitTracker Pro",
          body: "It's 8 PM! Don't forget to complete your habits.",
        },
        trigger: { hour: 20, minute: 0, repeats: true },
      });
    }
  };

  return (
    <HabitContext.Provider value={{ 
      habits, 
      addHabit, 
      deleteHabit, 
      updateHabit, // <--- Add this
      toggleHabitCompletion 
    }}>
      {children}
    </HabitContext.Provider>
  );
};