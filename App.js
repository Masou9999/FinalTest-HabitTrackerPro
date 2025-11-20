import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack'; // Import TransitionPresets
import { Ionicons } from '@expo/vector-icons';
import { HabitProvider } from './src/context/HabitContext';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import AddHabitScreen from './src/screens/AddHabitScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HabitList" component={HomeScreen} />
      
      {/* Updated Options for Add/Edit Screen */}
      <Stack.Screen 
        name="AddHabit" 
        component={AddHabitScreen} 
        options={{ 
          // This makes it look like a card sheet
          presentation: 'modal', 
          // This allows the swipe down gesture
          gestureEnabled: true,  
          // This forces the visual style of an iOS modal (swipeable) even on Android
          ...TransitionPresets.ModalPresentationIOS, 
          // Optional: Hide the default header so we use our custom one
          headerShown: false 
        }} 
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <HabitProvider>
      <NavigationContainer>
        <StatusBar barStyle="light-content" />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarStyle: {
              backgroundColor: '#1E1E1E',
              borderTopWidth: 0,
              height: 60,
              paddingBottom: 10
            },
            tabBarActiveTintColor: '#6C63FF',
            tabBarInactiveTintColor: '#666',
            tabBarIcon: ({ color, size }) => {
              let iconName;
              if (route.name === 'Home') iconName = 'list';
              else if (route.name === 'Analytics') iconName = 'stats-chart';
              return <Ionicons name={iconName} size={size} color={color} />;
            },
          })}
        >
          <Tab.Screen name="Home" component={HomeStack} />
          <Tab.Screen name="Analytics" component={AnalyticsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </HabitProvider>
  );
}