import {StyleSheet, Text, TouchableOpacity, View, Linking} from 'react-native';
import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BottomBookButton = () => {
  const navigation = useNavigation();

  const handleChatPress = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      navigation.navigate('LoginScreen');
      return;
    }
    navigation.navigate('ChatDetailScreen');
  };

  const handleBookPress = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      navigation.navigate('LoginScreen');
      return;
    }
    navigation.navigate('AppointmentBookingScreen', {
      appointmentType: 'Treatment',
    });
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
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 60,
    backgroundColor: '#fffff2',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});
