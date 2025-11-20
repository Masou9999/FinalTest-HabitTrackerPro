import React, { useContext } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { HabitContext } from '../context/HabitContext';
import { LineChart } from 'react-native-chart-kit';
import { Calendar } from 'react-native-calendars';

const screenWidth = Dimensions.get("window").width;

export default function AnalyticsScreen() {
  const { habits } = useContext(HabitContext);

  // Calculate total completions per day (for Graph FR-10)
  // This is dummy logic to simulate the graph data structure
  const graphData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [{ data: [2, 4, 3, 5, 4, 6, 5] }] // In real app, map this from habits.completedDates
  };

  // Prepare Calendar Marked Dates (FR-5)
  // Merging all habit dates into one view for the "Overview"
  const markedDates = {};
  habits.forEach(h => {
    Object.keys(h.completedDates).forEach(date => {
      markedDates[date] = { selected: true, marked: true, selectedColor: '#6C63FF' };
    });
  });

  const totalCompletions = habits.reduce((acc, h) => acc + h.totalCompleted, 0);
  const avgStreak = habits.length > 0 
    ? (habits.reduce((acc, h) => acc + h.streak, 0) / habits.length).toFixed(1) 
    : 0;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Analytics & Progress</Text>

      {/* FR-9: Statistics Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{totalCompletions}</Text>
          <Text style={styles.statLabel}>Total Done</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{avgStreak}</Text>
          <Text style={styles.statLabel}>Avg Streak</Text>
        </View>
      </View>

      {/* FR-10: Progress Graph */}
      <Text style={styles.sectionTitle}>Weekly Performance</Text>
      <LineChart
        data={graphData}
        width={screenWidth - 40}
        height={220}
        chartConfig={{
          backgroundColor: "#1E1E1E",
          backgroundGradientFrom: "#1E1E1E",
          backgroundGradientTo: "#1E1E1E",
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(108, 99, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: { borderRadius: 16 },
          propsForDots: { r: "6", strokeWidth: "2", stroke: "#6C63FF" }
        }}
        style={styles.chart}
        bezier
      />

      {/* FR-5: Calendar View */}
      <Text style={styles.sectionTitle}>History Overview</Text>
      <View style={styles.calendarContainer}>
        <Calendar
          markedDates={markedDates}
          theme={{
            backgroundColor: '#1E1E1E',
            calendarBackground: '#1E1E1E',
            textSectionTitleColor: '#b6c1cd',
            selectedDayBackgroundColor: '#6C63FF',
            selectedDayTextColor: '#ffffff',
            todayTextColor: '#6C63FF',
            dayTextColor: '#d9e1e8',
            textDisabledColor: '#2d4150',
            monthTextColor: '#FFF',
            arrowColor: '#6C63FF',
          }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', paddingTop: 50, paddingHorizontal: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFF', marginBottom: 20 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  statCard: {
    backgroundColor: '#1E1E1E', width: '48%', padding: 20, borderRadius: 16,
    alignItems: 'center', elevation: 5
  },
  statNumber: { fontSize: 32, fontWeight: 'bold', color: '#6C63FF' },
  statLabel: { color: '#888', marginTop: 5 },
  sectionTitle: { fontSize: 18, color: '#FFF', marginBottom: 15, fontWeight: '600' },
  chart: { borderRadius: 16, marginVertical: 8, marginBottom: 30 },
  calendarContainer: { paddingBottom: 50 }
});