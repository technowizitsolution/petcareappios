import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SafeAreaView} from 'react-native-safe-area-context';
import {StyleSheet, Text, TouchableOpacity, View, AppState} from 'react-native';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import HomeScreens from '../screens/HomeScreens';
import CalenderScreen from '../screens/CalenderScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TreatmentScreen from '../screens/TreatmentScreen';
import GroomingScreen from '../screens/GroomingScreen';
import SurgeryScreen from '../screens/SurgeryScreen';
import VaccinationScreen from '../screens/VaccinationScreen';
import TipsScreen from '../screens/TipsScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ChatDetailScreen from '../screens/ChatDetailScreen';
import SignUpScreen from '../screens/SignUpScreen';
import PetProfileScreen from '../screens/PetProfileScreen';
import AddPetScreen from '../screens/AddPetScreen';
import UpdatePetScreen from '../screens/UpdatePetScreen';
import UpdateUserProfileScreen from '../screens/UpdateUserProfileScreen';
import AppointmentBookingScreen from '../screens/AppointmentBookingScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import DeleteAccountScreen from '../screens/DeleteAccountScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const Router = () => {
  const [isLoggedin, setLoggedin] = useState(false);
  const [initialRoute, setInitialRoute] = useState('LoginScreen');
  const [isLoading, setIsLoading] = useState(true);

  const detectLogin = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const isUserLoggedIn = !!token;
      setLoggedin(isUserLoggedIn);
      setInitialRoute(isUserLoggedIn ? 'HomeScreens' : 'LoginScreen');

      // If user is logged out, make sure we're not in the loading state
      if (!isUserLoggedIn) {
        setIsLoading(false);
      }
    } catch (error) {
      console.log('Error detecting login:', error);
      setLoggedin(false);
      setInitialRoute('LoginScreen');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    detectLogin();

    // Listen for app state changes to re-check authentication
    const handleAppStateChange = nextAppState => {
      if (nextAppState === 'active') {
        detectLogin();
      }
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    // Set up an interval to periodically check authentication status
    const authCheckInterval = setInterval(detectLogin, 2000); // Check every 2 seconds

    return () => {
      subscription?.remove();
      clearInterval(authCheckInterval);
    };
  }, []);

  // Show loading screen while checking login status
  if (isLoading) {
    return null; // or a loading component
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
        initialRouteName={initialRoute} // Dynamic initial route based on login status
      >
        {!isLoggedin ? (
          // Show login flow + guest accessible screens when not logged in
          <>
            <Stack.Screen name="LoginScreen" component={LoginScreen} />
            <Stack.Screen
              name="ResetPasswordScreen"
              component={ResetPasswordScreen}
            />
            <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
            {/* Guest accessible screens */}
            <Stack.Screen name="HomeScreens">
              {props => (
                <TabNavigator
                  {...props}
                  isLoggedin={isLoggedin}
                  setLoggedin={setLoggedin}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="TreatmentScreen" component={TreatmentScreen} />
            <Stack.Screen name="GroomingScreen" component={GroomingScreen} />
            <Stack.Screen name="SurgeryScreen" component={SurgeryScreen} />
            <Stack.Screen
              name="VaccinationScreen"
              component={VaccinationScreen}
            />
            <Stack.Screen name="TipsScreen" component={TipsScreen} />
          </>
        ) : (
          // Show full app flow when logged in
          <>
            <Stack.Screen name="HomeScreens">
              {props => (
                <TabNavigator
                  {...props}
                  isLoggedin={isLoggedin}
                  setLoggedin={setLoggedin}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
            <Stack.Screen
              name="UpdateUserProfileScreen"
              component={UpdateUserProfileScreen}
            />
            <Stack.Screen
              name="DeleteAccountScreen"
              component={DeleteAccountScreen}
            />
            <Stack.Screen
              name="PetProfileScreen"
              component={PetProfileScreen}
            />
            <Stack.Screen name="UpdatePetScreen" component={UpdatePetScreen} />
            <Stack.Screen name="AddPetScreen" component={AddPetScreen} />
            <Stack.Screen name="TreatmentScreen" component={TreatmentScreen} />
            <Stack.Screen name="GroomingScreen" component={GroomingScreen} />
            <Stack.Screen name="SurgeryScreen" component={SurgeryScreen} />
            <Stack.Screen
              name="ChatDetailScreen"
              component={ChatDetailScreen}
            />
            <Stack.Screen
              name="VaccinationScreen"
              component={VaccinationScreen}
            />
            <Stack.Screen name="TipsScreen" component={TipsScreen} />
            <Stack.Screen
              name="AppointmentBookingScreen"
              component={AppointmentBookingScreen}
            />
            {/* Add login screens here too so they can be accessed via navigation.reset() */}
            <Stack.Screen name="LoginScreen" component={LoginScreen} />
            <Stack.Screen
              name="ResetPasswordScreen"
              component={ResetPasswordScreen}
            />
            <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

//Bottom CustomTabBar
const CustomTabBar = ({state, descriptors, navigation, isLoggedin}) => {
  return (
    <SafeAreaView style={{backgroundColor: '#fffffa'}} edges={['bottom']}>
      <View style={styles.bottomNav}>
        {state.routes.map((route, index) => {
          const {options} = descriptors[route.key];
          const isFocused = state.index === index;

          let iconName;
          let screenLabel;
          let restricted = false;
          switch (route.name) {
            case 'Home':
              iconName = 'home-outline';
              screenLabel = 'Home';
              break;
            case 'Calender':
              iconName = 'calendar-outline';
              screenLabel = 'Calender';
              break;
            case 'Chat':
              iconName = 'chatbubbles-outline';
              screenLabel = 'Chat';
              restricted = true;
              break;
            case 'Profile':
              iconName = 'person-outline';
              screenLabel = 'Profile';
              restricted = true;
              break;
            default:
              iconName = 'circle-outline';
          }

          const onPress = () => {
            if (restricted && !isLoggedin) {
              navigation.navigate('LoginScreen');
              return;
            }
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={index}
              accessibilityRole="button"
              accessibilityState={isFocused ? {selected: true} : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              style={styles.navIcon}>
              <Ionicons
                name={iconName}
                size={20}
                color={isFocused ? '#FB6A43' : '#B6B6B6'}
              />
              <Text
                style={[
                  styles.navLabel,
                  {color: isFocused ? '#FB6A43' : '#B6B6B6'},
                ]}>
                {screenLabel}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

//Bottom Tab Navigator
const TabNavigator = ({isLoggedin, setLoggedin}) => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
      tabBar={props => <CustomTabBar {...props} isLoggedin={isLoggedin} />}>
      <Tab.Screen name="Home" component={HomeScreens} />
      <Tab.Screen name="Calender" component={CalenderScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fffffa',
    paddingVertical: 5,
    elevation: 5,
    paddingBottom: 10,
    shadowColor: '#000', // Added shadow color
    shadowOffset: {width: 0, height: -8}, // Adjusted shadow offset for top shadow only
    shadowOpacity: 0.1, // Added shadow opacity
    shadowRadius: 4, // Added shadow radius
  },
  navIcon: {
    alignItems: 'center',
    marginTop: 5,
  },
  navLabel: {
    marginTop: 5,
    fontSize: 12,
    fontWeight: '500',
  },
});

export default Router;
