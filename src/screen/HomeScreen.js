import React, { useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HabitContext } from '../context/HabitContext';
import { LinearGradient } from 'expo-linear-gradient'; // *Requires expo-linear-gradient*

// Helper to get "Modern" colors
const getThemeColor = (colorName) => {
  const colors = { blue: '#4F8EF7', purple: '#8A2BE2', green: '#00C851', orange: '#FF8800' };
  return colors[colorName] || '#4F8EF7';
};

export default function HomeScreen({ navigation }) {
  const { habits, toggleHabitCompletion } = useContext(HabitContext);
  const today = new Date().toISOString().split('T')[0];

  const renderHabit = ({ item }) => {
    const isCompleted = !!item.completedDates[today];
    const themeColor = getThemeColor(item.color);

    return (
      <View style={styles.card}>
        <View style={styles.cardLeft}>
          <View style={[styles.iconContainer, { backgroundColor: themeColor + '20' }]}>
            <Ionicons name={item.icon || 'star'} size={24} color={themeColor} />
          </View>
          <View>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.streakText}>🔥 Streak: {item.streak} days</Text>
          </View>
        </View>

        <TouchableOpacity onPress={() => toggleHabitCompletion(item.id)}>
          <View style={[
            styles.checkbox, 
            isCompleted && { backgroundColor: themeColor, borderColor: themeColor }
          ]}>
            {isCompleted && <Ionicons name="checkmark" size={20} color="#FFF" />}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, Achiever!</Text>
        <Text style={styles.subHeader}>Your goals for today</Text>
      </View>

      <FlatList
        data={habits}
        renderItem={renderHabit}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyText}>No habits yet. Create one!</Text>}
      />

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => navigation.navigate('AddHabit')}
      >
        <Ionicons name="add" size={32} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', paddingTop: 50 },
  header: { paddingHorizontal: 20, marginBottom: 20 },
  greeting: { fontSize: 28, fontWeight: 'bold', color: '#FFF' },
  subHeader: { fontSize: 16, color: '#888' },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: { padding: 10, borderRadius: 12, marginRight: 15 },
  cardTitle: { color: '#FFF', fontSize: 18, fontWeight: '600' },
  streakText: { color: '#AAA', fontSize: 12, marginTop: 4 },
  checkbox: {
    width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: '#444',
    justifyContent: 'center', alignItems: 'center'
  },
  fab: {
    position: 'absolute', bottom: 30, right: 30,
    backgroundColor: '#6C63FF', width: 60, height: 60, borderRadius: 30,
    justifyContent: 'center', alignItems: 'center', elevation: 10,
    shadowColor: '#6C63FF', shadowOpacity: 0.4, shadowRadius: 10
  },
  emptyText: { color: '#555', textAlign: 'center', marginTop: 50 }
});