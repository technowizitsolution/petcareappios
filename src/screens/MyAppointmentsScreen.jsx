import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import notificationService from '../services/NotificationService';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'; 

const URL = 'https://petcare-1c443.el.r.appspot.com';

const MyAppointmentsScreen = () => {
  const navigation = useNavigation();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [remindersEnabled, setRemindersEnabled] = useState({});

  // Fetch appointments whenever the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchAppointments();
      return () => {
        // Cleanup if needed
      };
    }, []),
  );

  // Load reminder preferences from storage
  useEffect(() => {
    const loadReminderPreferences = async () => {
      try {
        const savedPreferences = await AsyncStorage.getItem(
          'appointmentReminders',
        );
        if (savedPreferences) {
          setRemindersEnabled(JSON.parse(savedPreferences));
        }
      } catch (error) {
        console.error('Error loading reminder preferences:', error);
      }
    };

    loadReminderPreferences();
  }, []);

  // Save reminder preferences when they change
  useEffect(() => {
    const saveReminderPreferences = async () => {
      try {
        await AsyncStorage.setItem(
          'appointmentReminders',
          JSON.stringify(remindersEnabled),
        );
      } catch (error) {
        console.error('Error saving reminder preferences:', error);
      }
    };

    if (Object.keys(remindersEnabled).length > 0) {
      saveReminderPreferences();
    }
  }, [remindersEnabled]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Authentication Error', 'Please log in first');
        navigation.navigate('Login');
        return;
      }

      const response = await fetch(`${URL}/appointments`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }

      const data = await response.json();

      // Get pet details for each appointment
      const appointmentsWithPets = await Promise.all(
        data.map(async appointment => {
          try {
            const petResponse = await fetch(`${URL}/pets/${appointment.pet}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
            });

            if (petResponse.ok) {
              const petData = await petResponse.json();
              return {...appointment, petName: petData.name};
            }
            return {...appointment, petName: 'Unknown Pet'};
          } catch (error) {
            console.error('Error fetching pet details:', error);
            return {...appointment, petName: 'Unknown Pet'};
          }
        }),
      );

      setAppointments(appointmentsWithPets);

      // Initialize reminders state for new appointments
      const updatedReminders = {...remindersEnabled};
      appointmentsWithPets.forEach(appointment => {
        if (updatedReminders[appointment._id] === undefined) {
          updatedReminders[appointment._id] = true; // Enable by default
        }
      });
      setRemindersEnabled(updatedReminders);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      Alert.alert('Error', 'Unable to fetch your appointments');
    } finally {
      setLoading(false);
    }
  };

  const toggleReminder = appointmentId => {
    setRemindersEnabled(prev => {
      const newState = {...prev, [appointmentId]: !prev[appointmentId]};

      // Handle reminder toggling
      if (newState[appointmentId]) {
        // Re-enable reminder if it's turned back on
        const appointment = appointments.find(a => a._id === appointmentId);
        if (appointment) {
          notificationService.scheduleAppointmentReminder(
            appointmentId,
            appointment.appointmentType,
            appointment.petName,
            appointment.appointmentDate,
          );
        }
      } else {
        // Cancel reminder if turned off
        notificationService.cancelNotification(appointmentId);
        notificationService.cancelNotification(`${appointmentId}-same-day`);
      }

      return newState;
    });
  };

  const cancelAppointment = async appointmentId => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        {text: 'No', style: 'cancel'},
        {
          text: 'Yes',
          onPress: async () => {
            try {
              setLoading(true);
              const token = await AsyncStorage.getItem('token');
              if (!token) {
                Alert.alert('Authentication Error', 'Please log in first');
                return;
              }

              const response = await fetch(
                `${URL}/appointments/${appointmentId}`,
                {
                  method: 'DELETE',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                  },
                },
              );

              if (!response.ok) {
                throw new Error('Failed to cancel appointment');
              }

              // Cancel any scheduled notifications for this appointment
              notificationService.cancelNotification(appointmentId);
              notificationService.cancelNotification(
                `${appointmentId}-same-day`,
              );

              // Remove from reminder preferences
              setRemindersEnabled(prev => {
                const newState = {...prev};
                delete newState[appointmentId];
                return newState;
              });

              Alert.alert('Success', 'Appointment cancelled successfully');
              fetchAppointments();
            } catch (error) {
              console.error('Error cancelling appointment:', error);
              Alert.alert('Error', 'Unable to cancel appointment');
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  const getAppointmentDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isUpcoming = dateString => {
    const appointmentDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return appointmentDate >= today;
  };

  const renderAppointmentItem = ({item}) => {
    const upcoming = isUpcoming(item.appointmentDate);

    return (
      <View
        style={[styles.appointmentCard, !upcoming && styles.pastAppointment]}>
        <View style={styles.appointmentHeader}>
          <Text style={styles.appointmentType}>{item.appointmentType}</Text>
          {upcoming ? (
            <View style={styles.upcomingBadge}>
              <Text style={styles.upcomingText}>Upcoming</Text>
            </View>
          ) : (
            <View style={styles.pastBadge}>
              <Text style={styles.pastText}>Past</Text>
            </View>
          )}
        </View>

        <View style={styles.appointmentDetails}>
          <View style={styles.detailRow}>
            <FontAwesome5 name="paw" size={16} color="#FB6A43" />
            <Text style={styles.detailText}>
              {item.petName
                ? item.petName.charAt(0).toUpperCase() + item.petName.slice(1)
                : 'Unknown Pet'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <FontAwesome5 name="calendar-alt" size={16} color="#FB6A43" />
            <Text style={styles.detailText}>
              {getAppointmentDate(item.appointmentDate)}
            </Text>
          </View>

          {item.appointmentType === 'Grooming' && item.groomingType && (
            <View style={styles.detailRow}>
              <FontAwesome5 name="cut" size={16} color="#FB6A43" />
              <Text style={styles.detailText}>
                {item.groomingType.charAt(0).toUpperCase() +
                  item.groomingType.slice(1)}{' '}
                Grooming
              </Text>
            </View>
          )}
        </View>

        {upcoming && (
          <View style={styles.actionRow}>
            <View style={styles.reminderToggle}>
              <Text style={styles.reminderLabel}>Reminders</Text>
              <Switch
                value={remindersEnabled[item._id] || false}
                onValueChange={() => toggleReminder(item._id)}
                trackColor={{false: '#dddddd', true: '#FB6A43'}}
                thumbColor={remindersEnabled[item._id] ? '#ffffff' : '#f4f3f4'}
              />
            </View>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => cancelAppointment(item._id)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>My Appointments</Text>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#FB6A43" />
        </View>
      ) : appointments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FontAwesome5 name="calendar-times" size={60} color="#cccccc" />
          <Text style={styles.emptyText}>No appointments found</Text>
          <TouchableOpacity
            style={styles.bookButton}
            onPress={() => navigation.navigate('AppointmentBookingScreen')}>
            <Text style={styles.bookButtonText}>Book an Appointment</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={appointments}
            renderItem={renderAppointmentItem}
            keyExtractor={item => item._id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AppointmentBookingScreen')}>
            <Text style={styles.addButtonText}>Book New Appointment</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FDFDFD',
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FB6A43',
    marginBottom: 20,
    textAlign: 'center',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingBottom: 80,
  },
  appointmentCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  pastAppointment: {
    opacity: 0.7,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 10,
  },
  appointmentType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  upcomingBadge: {
    backgroundColor: '#E6F7FF',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  upcomingText: {
    color: '#0091FF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  pastBadge: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  pastText: {
    color: '#666666',
    fontWeight: 'bold',
    fontSize: 12,
  },
  appointmentDetails: {
    marginVertical: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#444',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  reminderToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reminderLabel: {
    marginRight: 8,
    fontSize: 14,
    color: '#666',
  },
  cancelButton: {
    backgroundColor: '#FFE5E5',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  cancelButtonText: {
    color: '#FF4040',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
    marginTop: 15,
    marginBottom: 20,
  },
  bookButton: {
    backgroundColor: '#FB6A43',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 5,
    marginTop: 20,
  },
  bookButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#FB6A43',
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default MyAppointmentsScreen;
