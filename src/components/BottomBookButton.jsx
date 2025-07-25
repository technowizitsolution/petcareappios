import {Linking, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Modified BottomBookButton.jsx
const BottomBookButton = ({serviceType = 'Treatment', selectedDate = null}) => {
  const navigation = useNavigation();

  const handleBookPress = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      navigation.navigate('LoginScreen');
      return;
    }
    navigation.navigate('AppointmentBookingScreen', {
      appointmentType: serviceType,
      appointmentDate: selectedDate ? selectedDate.toISOString() : null,
    });
  };

  const handleChatPress = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      navigation.navigate('LoginScreen');
      return;
    }
    navigation.navigate('ChatDetailScreen');
  };

  const handleCallPress = () => {
    Linking.openURL('tel:+919779908999');
  };

  return (
    <View>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.chatButton} onPress={handleChatPress}>
          <Ionicons name="chatbubble-ellipses-sharp" size={25} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bookButton} onPress={handleBookPress}>
          <Text style={styles.bookText}>Book Now </Text>
          <Ionicons name="arrow-forward" size={25} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.callButton} onPress={handleCallPress}>
          <Ionicons name="call" size={25} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default BottomBookButton;

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  chatButton: {
    backgroundColor: '#FB6A43',
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatIcon: {
    color: '#FFFFFF',
    fontSize: 20,
  },
  bookButton: {
    backgroundColor: '#FB6A43',
    flex: 1,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    flexDirection: 'row',
  },
  bookText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 20,
  },
  callButton: {
    backgroundColor: '#FB6A43',
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callIcon: {
    color: '#FFFFFF',
    fontSize: 20,
  },
});
