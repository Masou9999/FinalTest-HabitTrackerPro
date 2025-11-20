import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Switch } from 'react-native';
import { HabitContext } from '../context/HabitContext';
import { Ionicons } from '@expo/vector-icons';

export default function AddHabitScreen({ navigation, route }) {
  const { addHabit, updateHabit } = useContext(HabitContext);
  
  const habitToEdit = route.params?.habitToEdit;
  const isEditing = !!habitToEdit;

  // State initialization
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState('blue');
  const [selectedIcon, setSelectedIcon] = useState('fitness');
  const [dailyReminder, setDailyReminder] = useState(false);

  // Pre-fill data if editing
  useEffect(() => {
    if (isEditing) {
      setTitle(habitToEdit.title);
      setDescription(habitToEdit.description || '');
      setSelectedColor(habitToEdit.color);
      setSelectedIcon(habitToEdit.icon);
      setDailyReminder(habitToEdit.reminder || false);
      navigation.setOptions({ title: 'Edit Habit' });
    }
  }, [habitToEdit]);

  const colors = ['blue', 'purple', 'green', 'orange'];
  const icons = ['fitness', 'book', 'water', 'code', 'bed'];

  const handleSave = () => {
    // VALIDATION LOGIC UPDATE:
    // Only strictly require Title if we are creating a NEW habit.
    if (!isEditing && !title.trim()) {
      return alert("Title is required for new habits!");
    }

    // If Editing, and Title is empty, fallback to the original title.
    // This means you can just edit the Icon/Color without touching the text.
    const finalTitle = title.trim() || (isEditing ? habitToEdit.title : "Untitled Habit");

    const habitData = {
      title: finalTitle,
      description: description,
      icon: selectedIcon,
      color: selectedColor,
      reminder: dailyReminder
    };

    if (isEditing) {
      updateHabit(habitToEdit.id, habitData);
    } else {
      addHabit(habitData);
    }
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>{isEditing ? 'Edit Habit' : 'New Habit'}</Text>
        {/* Swipe down hint */}
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

      <View style={styles.switchRow}>
        <Text style={styles.label}>Daily Reminder (7:00 AM)</Text>
        <Switch 
          value={dailyReminder} 
          onValueChange={setDailyReminder}
          trackColor={{ false: "#767577", true: "#6C63FF" }}
        />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>{isEditing ? 'Save Changes' : 'Create Habit'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20, paddingTop: 20 },
  headerRow: { alignItems: 'center', marginBottom: 20 },
  dragBar: { width: 40, height: 5, backgroundColor: '#333', borderRadius: 3, marginTop: 10 }, // Visual cue for swipe down
  header: { fontSize: 28, fontWeight: 'bold', color: '#FFF', alignSelf: 'flex-start', marginTop: 20 },
  
  label: { color: '#AAA', marginBottom: 10, fontSize: 16 },
  input: { backgroundColor: '#1E1E1E', color: '#FFF', borderRadius: 12, padding: 15, marginBottom: 25, fontSize: 16 },
  row: { flexDirection: 'row', marginBottom: 25, gap: 15 },
  optionBox: { padding: 15, backgroundColor: '#1E1E1E', borderRadius: 12 },
  selectedOption: { backgroundColor: '#6C63FF' },
  colorCircle: { width: 40, height: 40, borderRadius: 20, margin: 5 },
  selectedColor: { borderWidth: 3, borderColor: '#FFF' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 },
  saveButton: { backgroundColor: '#6C63FF', padding: 18, borderRadius: 16, alignItems: 'center' },
  saveText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});