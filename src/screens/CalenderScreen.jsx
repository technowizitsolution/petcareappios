import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  ImageBackground,
  ScrollView,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import BottomBookButton from '../components/BottomBookButton';
import {Calendar} from 'react-native-calendars';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {width} = Dimensions.get('window');
const URL = 'https://petcare-1c443.el.r.appspot.com';

const CalenderScreen = () => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [events, setEvents] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAppointments();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch(`${URL}/appointments`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Add the token to the headers
        },
      });
      const data = await response.json();
      if (data.appointments && Array.isArray(data.appointments)) {
        const appointmentDates = data.appointments.map(appointment => ({
          id: appointment._id,
          title: appointment.title || 'Appointment',
          type: appointment.pet?.name || 'Pet Care', // Add optional chaining to handle null or undefined
          date: appointment.appointmentDate.split('T')[0], // Extract date part
          time: appointment.status,
        }));
        setEvents(appointmentDates);

        // Create marked dates object
        const marked = {};
        appointmentDates.forEach(appointment => {
          marked[appointment.date] = {
            marked: true,
            dotColor: '#FB6A43',
          };
        });
        setMarkedDates(marked);
      } else {
        console.error('Error: Expected an array but received:', data);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const renderEventCard = ({item}) => (
    <View style={styles.eventCard}>
      <View style={styles.eventIcon}>
        <Text style={styles.eventIconText}>PC</Text>
      </View>
      <View style={styles.eventDetails}>
        <Text style={styles.eventTitle}>{item.title}</Text>
        <Text style={styles.eventSubtitle}>Pet Name : {item.type}</Text>
      </View>
      <View style={styles.eventTime}>
        <Ionicons name="calendar-outline" size={18} color="#FB6A43" />
        <Text style={styles.eventDate}>{item.date}</Text>
        <Text style={styles.eventTimeText}>{item.time}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{flex: 1}}>
      <ImageBackground
        source={require('../assets/images/CalenderScreenBG.png')}
        style={styles.background}>
        <FlatList
          ListHeaderComponent={
            <>
              <View style={styles.container}>
                {/* Calendar */}
                <View style={styles.calendarContainer}>
                  <Calendar
                    current={selectedDate}
                    onDayPress={day => setSelectedDate(day.dateString)}
                    markedDates={{
                      ...markedDates,
                      [selectedDate]: {
                        selected: true,
                        marked: true,
                        selectedColor: '#FB6A43',
                      },
                    }}
                    theme={{
                      todayTextColor: '#FB6A43',
                      arrowColor: '#FB6A43',
                      selectedDayBackgroundColor: '#FB6A43',
                      selectedDayTextColor: '#ffffff',
                    }}
                    style={styles.calendar}
                  />
                </View>

                {/* Selected Date */}
                <Text style={styles.selectedDate}>
                  {new Date(selectedDate).toDateString()}
                </Text>
              </View>
            </>
          }
          data={events.filter(event => event.date === selectedDate)}
          keyExtractor={item => item.id.toString()}
          renderItem={renderEventCard}
          ListEmptyComponent={
            <Text style={styles.noEventsText}>No events on this day.</Text>
          }
          contentContainerStyle={styles.scrollContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
        {/* Footer Actions */}
        {/* <BottomBookButton /> */}
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'space-between',
    paddingTop: 20,
  },
  container: {
    paddingTop: 150,
    paddingHorizontal: 20,
  },
  selectedDate: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A4A4A',
    textAlign: 'center',
    marginTop: 40,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginVertical: 20,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  eventIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FB6A43',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  eventIconText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  eventSubtitle: {
    fontSize: 14,
    color: '#777',
    marginVertical: 4,
  },
  eventMeta: {
    fontSize: 12,
    color: '#999',
  },
  eventTime: {
    alignItems: 'flex-end',
  },
  eventDate: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  eventTimeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FB6A43',
    marginTop: 2,
  },
  noEventsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
    marginTop: 20,
  },
  scrollContainer: {
    justifyContent: 'space-between',
  },
  calendarContainer: {
    marginHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 20,
  },
  calendar: {
    borderRadius: 15,
    padding: 10,
  },
});

export default CalenderScreen;
