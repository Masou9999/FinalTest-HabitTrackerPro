import React, { useContext, useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, TouchableOpacity, FlatList } from 'react-native';
import { HabitContext } from '../context/HabitContext';
import { LineChart } from 'react-native-chart-kit'; // FR-10: Line Chart
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get("window").width;

const getThemeColor = (colorName) => {
  const colors = { blue: '#4F8EF7', purple: '#8A2BE2', green: '#00C851', orange: '#FF8800' };
  return colors[colorName] || '#4F8EF7';
};

export default function AnalyticsScreen() {
  const { habits } = useContext(HabitContext);
  const [selectedHabitId, setSelectedHabitId] = useState(null);

  useEffect(() => {
    if (habits.length > 0 && !selectedHabitId) {
      setSelectedHabitId(habits[0].id);
    }
  }, [habits]);

  const selectedHabit = habits.find(h => h.id === selectedHabitId);

  // --- FR-10: Dynamic Graph Data Logic ---
  const getChartData = () => {
    if (!selectedHabit) {
      return { labels: [], datasets: [{ data: [0] }] };
    }

    const labels = [];
    const data = [];
    const today = new Date();

    // Loop through the last 7 days (including today)
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      
      // Label: Day Name (e.g., "Mon")
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
      labels.push(dayLabel);

      // Data: 1 if completed, 0 if missed
      const dateStr = d.toISOString().split('T')[0];
      const isCompleted = selectedHabit.completedDates[dateStr] ? 1 : 0;
      data.push(isCompleted);
    }

    return {
      labels: labels,
      datasets: [{ data: data }]
    };
  };

  // --- FR-5: Calendar Logic ---
  const getMarkedDates = () => {
    if (!selectedHabit) return {};
    const marked = {};
    const themeColor = getThemeColor(selectedHabit.color);
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dateStr = date.toISOString().split('T')[0];
      if (dateStr >= todayStr) break; 

      const isCompleted = !!selectedHabit.completedDates[dateStr];

      if (isCompleted) {
        marked[dateStr] = { selected: true, selectedColor: themeColor };
      } else {
        marked[dateStr] = { marked: true, dotColor: '#555', activeOpacity: 0 };
      }
    }
    if (selectedHabit.completedDates[todayStr]) {
      marked[todayStr] = { selected: true, selectedColor: themeColor };
    }
    return marked;
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Analytics</Text>

      {/* Habit Selector */}
      <View style={styles.selectorContainer}>
        <FlatList
          horizontal
          data={habits}
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id}
          renderItem={({ item }) => {
            const isActive = item.id === selectedHabitId;
            const color = getThemeColor(item.color);
            return (
              <TouchableOpacity 
                onPress={() => setSelectedHabitId(item.id)}
                style={[styles.tabItem, isActive && { backgroundColor: color }]}
              >
                <Ionicons name={item.icon || 'star'} size={18} color={isActive ? '#FFF' : color} style={{ marginRight: 5 }} />
                <Text style={[styles.tabText, isActive && { color: '#FFF' }]}>{item.title}</Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {selectedHabit ? (
        <>
          {/* FR-10: Progress Graph (Corrected) */}
          <Text style={styles.sectionTitle}>Last 7 Days Activity</Text>
          <LineChart
            data={getChartData()} // <--- Using dynamic data here
            width={screenWidth - 40}
            height={220}
            fromZero={true} // Ensures Y-axis starts at 0
            yAxisInterval={1} // Helps format binary 0/1 data cleanly
            segments={2}      // Limits grid lines since we only have 0 and 1
            chartConfig={{
              backgroundColor: "#1E1E1E",
              backgroundGradientFrom: "#1E1E1E",
              backgroundGradientTo: "#1E1E1E",
              decimalPlaces: 0, // No decimals (0 or 1)
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: { borderRadius: 16 },
              propsForDots: { r: "5", strokeWidth: "2", stroke: getThemeColor(selectedHabit.color) }
            }}
            style={styles.chart}
            bezier
          />

          {/* FR-9: Stats Reports */}
          <View style={styles.statsRow}>
             <View style={styles.statBox}>
                <Text style={styles.statNum}>{selectedHabit.totalCompleted}</Text>
                <Text style={styles.statLabel}>Total Completed Days</Text>
             </View>
             <View style={styles.statBox}>
                <Text style={styles.statNum}>{selectedHabit.streak}</Text>
                <Text style={styles.statLabel}>Current Streak</Text>
             </View>
             <View style={styles.statBox}>
                <Text style={styles.statNum}>{selectedHabit.longestStreak || 0}</Text>
                <Text style={styles.statLabel}>Longest Streak</Text>
             </View>
          </View>

          {/* FR-5: Calendar View */}
          <Text style={styles.sectionTitle}>Monthly Overview</Text>
          <View style={styles.calendarContainer}>
            <Calendar
              key={selectedHabitId} 
              markedDates={getMarkedDates()}
              theme={{
                backgroundColor: '#1E1E1E',
                calendarBackground: '#1E1E1E',
                textSectionTitleColor: '#b6c1cd',
                selectedDayBackgroundColor: getThemeColor(selectedHabit.color),
                selectedDayTextColor: '#ffffff',
                todayTextColor: getThemeColor(selectedHabit.color),
                dayTextColor: '#d9e1e8',
                textDisabledColor: '#2d4150',
                monthTextColor: '#FFF',
                arrowColor: getThemeColor(selectedHabit.color),
                dotStyle: { width: 8, height: 8, borderRadius: 4, marginTop: 2 }
              }}
            />
          </View>
        </>
      ) : (
        <Text style={styles.emptyText}>Select a habit to view progress.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', paddingTop: 50, paddingHorizontal: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFF', marginBottom: 20 },
  selectorContainer: { marginBottom: 25, height: 50 },
  tabItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#333', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, marginRight: 10 },
  tabText: { color: '#AAA', fontWeight: '600' },
  sectionTitle: { fontSize: 18, color: '#FFF', marginBottom: 15, fontWeight: '600', marginTop: 10 },
  calendarContainer: { backgroundColor: '#1E1E1E', borderRadius: 16, padding: 10, paddingBottom: 20, marginBottom: 50 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statBox: { backgroundColor: '#1E1E1E', width: '30%', padding: 15, borderRadius: 12, alignItems: 'center' },
  statNum: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  statLabel: { color: '#888', fontSize: 10, marginTop: 4,justifyContent: 'center', textAlign: 'center' },
  chart: { borderRadius: 16, marginVertical: 8, marginBottom: 30 },
  emptyText: { color: '#666', textAlign: 'center', marginTop: 50 }
});