import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Switch, Platform } from 'react-native';
import { HabitContext } from '../context/HabitContext';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function AddHabitScreen({ navigation, route }) {
  const { addHabit, updateHabit } = useContext(HabitContext);
  
  const habitToEdit = route.params?.habitToEdit;
  const isEditing = !!habitToEdit;

  const getDefaultTime = () => {
    const d = new Date();
    d.setHours(7, 0, 0, 0);
    return d;
  };

  // --- State ---
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState('blue');
  const [selectedIcon, setSelectedIcon] = useState('fitness');
  
  // FR-1: Start Date (Default: Today)
  const [startDate, setStartDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // FR-7: Daily Reminder
  const [dailyReminder, setDailyReminder] = useState(false);
  const [reminderTime, setReminderTime] = useState(getDefaultTime());
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (isEditing) {
      setTitle(habitToEdit.title);
      setDescription(habitToEdit.description || '');
      setSelectedColor(habitToEdit.color);
      setSelectedIcon(habitToEdit.icon);
      
      // Load Start Date
      if (habitToEdit.startDate) {
        setStartDate(new Date(habitToEdit.startDate));
      }

      setDailyReminder(habitToEdit.reminder || false);
      
      if (habitToEdit.reminderTime) {
        setReminderTime(new Date(habitToEdit.reminderTime));
      } else {
        setReminderTime(getDefaultTime());
      }
      
      navigation.setOptions({ title: 'Edit Habit' });
    }
  }, [habitToEdit]);

  const colors = ['blue', 'purple', 'green', 'orange'];
  const icons = ['fitness', 'book', 'water', 'code', 'bed'];

  // --- Handlers ---

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || startDate;
    setShowDatePicker(Platform.OS === 'ios'); 
    setStartDate(currentDate);
  };

  const onTimeChange = (event, selectedDate) => {
    const currentDate = selectedDate || reminderTime;
    setShowTimePicker(Platform.OS === 'ios');
    setReminderTime(currentDate);
  };

  const handleSave = () => {
    if (!isEditing && !title.trim()) {
      return alert("Title is required for new habits!");
    }

    const finalTitle = title.trim() || (isEditing ? habitToEdit.title : "Untitled Habit");

    const habitData = {
      title: finalTitle,
      description: description,
      icon: selectedIcon,
      color: selectedColor,
      // Save Start Date
      startDate: startDate.toISOString().split('T')[0], // Format: YYYY-MM-DD
      reminder: dailyReminder,
      reminderTime: dailyReminder ? reminderTime.toISOString() : null 
    };

    if (isEditing) {
      updateHabit(habitToEdit.id, habitData);
    } else {
      addHabit(habitData);
    }
    navigation.goBack();
  };

  // Helper for displaying formatted date
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  // Helper for displaying formatted time
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>{isEditing ? 'Edit Habit' : 'New Habit'}</Text>
        <View style={styles.dragBar} />
      </View>

      <Text style={styles.label}>Title</Text>
      <TextInput 
        style={styles.input} 
        placeholder={isEditing ? habitToEdit.title : "e.g., Read 10 pages"} 
        placeholderTextColor="#666"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Description (Optional)</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Motivate yourself..." 
        placeholderTextColor="#666"
        value={description}
        onChangeText={setDescription}
      />

      {/* --- FR-1: Start Date Selection --- */}
      <Text style={styles.label}>Start Date</Text>
      <View style={styles.dateRow}>
        <Text style={styles.dateDisplay}>{formatDate(startDate)}</Text>
        
        {Platform.OS === 'android' && (
          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.changeButton}>
            <Text style={styles.changeButtonText}>Change Date</Text>
          </TouchableOpacity>
        )}

        {(showDatePicker || Platform.OS === 'ios') && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            onChange={onDateChange}
            themeVariant="dark"
            textColor="white"
            style={{ width: 120 }}
          />
        )}
      </View>

      <Text style={styles.label}>Icon</Text>
      <View style={styles.row}>
        {icons.map(icon => (
          <TouchableOpacity key={icon} onPress={() => setSelectedIcon(icon)} style={[styles.optionBox, selectedIcon === icon && styles.selectedOption]}>
            <Ionicons name={icon} size={24} color={selectedIcon === icon ? '#FFF' : '#666'} />
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Color Theme</Text>
      <View style={styles.row}>
        {colors.map(color => (
          <TouchableOpacity 
            key={color} 
            onPress={() => setSelectedColor(color)} 
            style={[styles.colorCircle, { backgroundColor: color }, selectedColor === color && styles.selectedColor]} 
          />
        ))}
      </View>

      {/* --- FR-7: Notification Time --- */}
      <View style={styles.reminderContainer}>
        <View style={styles.switchRow}>
          <Text style={styles.label}>Daily Reminder</Text>
          <Switch 
            value={dailyReminder} 
            onValueChange={(val) => {
              setDailyReminder(val);
              if (val && !reminderTime) setReminderTime(getDefaultTime());
            }}
            trackColor={{ false: "#767577", true: "#6C63FF" }}
          />
        </View>

        {dailyReminder && (
          <View style={styles.timePickerRow}>
            <Text style={styles.timeLabel}>At what time?</Text>
            
            {Platform.OS === 'android' && (
              <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.timeButton}>
                <Text style={styles.timeButtonText}>{formatTime(reminderTime)}</Text>
              </TouchableOpacity>
            )}

            {(showTimePicker || Platform.OS === 'ios') && (
              <DateTimePicker
                value={reminderTime}
                mode="time"
                display="default"
                onChange={onTimeChange}
                themeVariant="dark"
                textColor="white"
                style={{ width: 100 }}
              />
            )}
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>{isEditing ? 'Save Changes' : 'Create Habit'}</Text>
      </TouchableOpacity>
      
      <View style={{ height: 50 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20, paddingTop: 20 },
  headerRow: { alignItems: 'center', marginBottom: 20 },
  dragBar: { width: 40, height: 5, backgroundColor: '#333', borderRadius: 3, marginTop: 10 },
  header: { fontSize: 28, fontWeight: 'bold', color: '#FFF', alignSelf: 'flex-start', marginTop: 20 },
  
  label: { color: '#AAA', marginBottom: 10, fontSize: 16 },
  input: { backgroundColor: '#1E1E1E', color: '#FFF', borderRadius: 12, padding: 15, marginBottom: 25, fontSize: 16 },
  
  // Date Row Styles
  dateRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    backgroundColor: '#1E1E1E', 
    padding: 15, 
    borderRadius: 12, 
    marginBottom: 25 
  },
  dateDisplay: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  changeButton: { backgroundColor: '#333', padding: 8, borderRadius: 8 },
  changeButtonText: { color: '#6C63FF', fontWeight: '600' },

  row: { flexDirection: 'row', marginBottom: 25, gap: 15 },
  optionBox: { padding: 15, backgroundColor: '#1E1E1E', borderRadius: 12 },
  selectedOption: { backgroundColor: '#6C63FF' },
  colorCircle: { width: 40, height: 40, borderRadius: 20, margin: 5 },
  selectedColor: { borderWidth: 3, borderColor: '#FFF' },
  
  reminderContainer: { 
    backgroundColor: '#1E1E1E', 
    borderRadius: 12, 
    padding: 15, 
    marginBottom: 30 
  },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timePickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#333'
  },
  timeLabel: { color: '#FFF', fontSize: 16 },
  timeButton: { backgroundColor: '#333', padding: 10, borderRadius: 8 },
  timeButtonText: { color: '#6C63FF', fontWeight: 'bold', fontSize: 16 },

  saveButton: { backgroundColor: '#6C63FF', padding: 18, borderRadius: 16, alignItems: 'center' },
  saveText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});