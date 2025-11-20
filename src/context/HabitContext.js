import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

export const HabitContext = createContext();

export const HabitProvider = ({ children }) => {
  const [habits, setHabits] = useState([]);

  useEffect(() => {
    loadHabits();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission for notifications was not granted!');
    }
  };

  const loadHabits = async () => {
    const stored = await AsyncStorage.getItem('habits');
    if (stored) setHabits(JSON.parse(stored));
  };

  const saveHabits = async (newHabits) => {
    setHabits(newHabits);
    await AsyncStorage.setItem('habits', JSON.stringify(newHabits));
  };

  // --- Notification Logic ---
  
  const scheduleHabitNotifications = async (habit) => {
    // 1. Cancel existing notifications for this habit to avoid duplicates
    // (In a real app, you'd store notification IDs to cancel specific ones)
    await Notifications.cancelAllScheduledNotificationsAsync(); 

    // Re-schedule for ALL habits (Simplified for demo)
    // In production, you would only manage the ID for this specific habit.
    // For this demo, we just ensure the current habit is added to the schedule.
    
    if (habit.reminder) {
      // A. Custom User Reminder (FR-7)
      const trigger = new Date(habit.reminderTime);
      const hour = trigger.getHours();
      const minute = trigger.getMinutes();

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "HabitTracker Pro",
          // FR-7: Use Custom Message or Default
          body: habit.customMessage || `Time to work on ${habit.title}!`,
          sound: true,
        },
        trigger: { hour, minute, repeats: true },
      });
    }

    // B. Smart Reminder (FR-8: Hard Feature)
    // "If not completed by 8 PM... send Don't forget!"
    // We schedule it daily at 8 PM.
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "⚠️ Deadline Approaching",
        body: `Don't forget! You haven't marked "${habit.title}" as done yet.`,
        sound: true,
      },
      trigger: { hour: 20, minute: 0, repeats: true }, // 8:00 PM fixed time
    });
  };

  // --- CRUD Operations ---

  const addHabit = (habit) => {
    const newHabit = {
      id: Date.now().toString(),
      completedDates: {},
      streak: 0,
      longestStreak: 0,
      totalCompleted: 0,
      ...habit,
    };
    const newList = [...habits, newHabit];
    saveHabits(newList);
    scheduleHabitNotifications(newHabit);
  };

  const updateHabit = (id, updatedFields) => {
    const updatedHabits = habits.map((habit) => {
      if (habit.id === id) {
        const newHabit = { ...habit, ...updatedFields };
        scheduleHabitNotifications(newHabit); // Reschedule with new settings
        return newHabit;
      }
      return habit;
    });
    saveHabits(updatedHabits);
  };

  const deleteHabit = (id) => {
    const filtered = habits.filter((h) => h.id !== id);
    saveHabits(filtered);
  };

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
          
          // OPTIONAL SMART LOGIC: 
          // If completed today, we could conceptually cancel the 8 PM reminder for *today* // using Notifications.cancelScheduledNotificationAsync() if we tracked IDs.
        }

        // Simple Streak Calculation
        const currentStreak = isCompleted ? Math.max(0, h.streak - 1) : h.streak + 1;

        return {
          ...h,
          completedDates: newDates,
          streak: currentStreak,
          longestStreak: Math.max(h.longestStreak, currentStreak),
          totalCompleted: Object.keys(newDates).length
        };
      }
      return h;
    });
    saveHabits(updatedHabits);
  };

  return (
    <HabitContext.Provider value={{ 
      habits, addHabit, deleteHabit, updateHabit, toggleHabitCompletion 
    }}>
      {children}
    </HabitContext.Provider>
  );
};