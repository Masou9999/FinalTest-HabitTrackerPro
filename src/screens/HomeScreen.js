import React, { useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HabitContext } from '../context/HabitContext';

const getThemeColor = (colorName) => {
  const colors = { blue: '#4F8EF7', purple: '#8A2BE2', green: '#00C851', orange: '#FF8800' };
  return colors[colorName] || '#4F8EF7';
};

export default function HomeScreen({ navigation }) {
  const { habits, toggleHabitCompletion, deleteHabit } = useContext(HabitContext);
  const today = new Date().toISOString().split('T')[0];

  // Handle Edit/Delete (FR-2)
  const handleLongPress = (habit) => {
    Alert.alert(
      "Manage Habit",
      `What do you want to do with "${habit.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Edit", onPress: () => navigation.navigate('AddHabit', { habitToEdit: habit }) },
        { text: "Delete", style: "destructive", onPress: () => deleteHabit(habit.id) }
      ]
    );
  };

  const renderHabit = ({ item }) => {
    // FR-3: Determine Today's completion status
    const isCompleted = !!item.completedDates[today];
    const themeColor = getThemeColor(item.color);

    return (
      <TouchableOpacity 
        activeOpacity={0.7}
        // FR-2: Long Press to Edit/Delete
        onLongPress={() => handleLongPress(item)} 
        // FR-4: User taps a habit to mark it completed (Entire card is tappable) [cite: 29]
        onPress={() => toggleHabitCompletion(item.id)} 
        style={[
          styles.card,
          // FR-4: Changes UI (e.g., border color, background) when completed 
          isCompleted && { borderColor: themeColor, backgroundColor: '#1A1A2E' }
        ]} 
      >
        <View style={styles.cardLeft}>
          {/* FR-3: Icon Display */}
          <View style={[styles.iconContainer, { backgroundColor: isCompleted ? themeColor : themeColor + '20' }]}>
            <Ionicons 
              name={item.icon || 'star'} 
              size={24} 
              color={isCompleted ? '#FFF' : themeColor} 
            />
          </View>
          
          <View style={styles.textContainer}>
            {/* FR-3: Title Display */}
            <Text style={[
                styles.cardTitle, 
                isCompleted && { textDecorationLine: 'line-through', color: '#666' }
              ]}>
              {item.title}
            </Text>

            {/* Description Display */}
            {item.description ? (
              <Text style={styles.cardDesc} numberOfLines={1}>
                {item.description}
              </Text>
            ) : null}

            {/* FR-3: Streak Count Display */}
            <Text style={styles.streakText}>🔥 Streak: {item.streak} days</Text>
          </View>
        </View>

        {/* FR-3: Today's completion status (Visual Checkbox) */}
        {/* Removed inner TouchableOpacity so it doesn't conflict with card press */}
        <View style={[
  styles.checkbox,
  // FR-4: Checkmark UI (visual tick box)
  isCompleted && { backgroundColor: themeColor, borderColor: themeColor }
]}>
  {isCompleted && <Ionicons name="checkmark" size={20} color="#FFF" />}
</View>

      </TouchableOpacity>
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
  
  // Card Styles
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,           // Added border for completion status effect
    borderColor: 'transparent', // Transparent by default
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 }, // Added flex: 1 to prevent text overflow
  textContainer: { flex: 1, marginRight: 10 }, // Ensure text wraps correctly
  
  iconContainer: { padding: 10, borderRadius: 12, marginRight: 15 },
  
  cardTitle: { color: '#FFF', fontSize: 18, fontWeight: '600' },
  
  // New Description Style
  cardDesc: { color: '#888', fontSize: 14, marginTop: 2, marginBottom: 2 },
  
  streakText: { color: '#FF8800', fontSize: 12, fontWeight: 'bold', marginTop: 2 },
  
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