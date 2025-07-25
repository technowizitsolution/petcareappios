// NotificationService.js
import PushNotification from 'react-native-push-notification';
import {Platform} from 'react-native';

class NotificationService {
  constructor() {
    this.configure();
  }

  configure = () => {
    // Configure the notification channel for Android
    PushNotification.createChannel(
      {
        channelId: 'pet-appointments', // Required for Android
        channelName: 'Pet Appointments', // Required for Android
        channelDescription: 'Notifications for pet appointments',
        playSound: true,
        soundName: 'default',
        importance: 4, // High importance - will pop on screen
        vibrate: true,
      },
      created => console.log(`Channel created: ${created}`),
    );

    // Initialize PushNotification
    PushNotification.configure({
      // Required: triggered when a notification is received while app is in the foreground
      onNotification: function (notification) {
        console.log('Notification received:', notification);

        // Required on iOS only
        if (notification.foreground && Platform.OS === 'ios') {
          notification.finish('backgroundFetchResultNoData');
        }
      },

      // IOS ONLY (optional): default: all
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      // Should notifications pop up when app is in foreground (default: false)
      popInitialNotification: true,

      // Required on Android, when system automatically creates the notification channel
      requestPermissions: Platform.OS === 'ios',
    });
  };

  // Schedule local notification for appointment booking confirmation
  scheduleBookingConfirmation = (appointmentType, petName, date) => {
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    PushNotification.localNotification({
      channelId: 'pet-appointments',
      title: 'Appointment Booked',
      message: `Your ${appointmentType} appointment for ${petName} on ${formattedDate} has been booked successfully.`,
      playSound: true,
      soundName: 'default',
      importance: 'high',
      priority: 'high',
    });
  };

  // Schedule reminder notification for upcoming appointment
  scheduleAppointmentReminder = (
    appointmentId,
    appointmentType,
    petName,
    date,
  ) => {
    const appointmentDate = new Date(date);

    // Notification one day before appointment at 9:00 AM
    const reminderDate = new Date(appointmentDate);
    reminderDate.setDate(appointmentDate.getDate() - 1);
    reminderDate.setHours(9, 0, 0, 0);

    // Only schedule reminder if it's in the future
    if (reminderDate > new Date()) {
      const formattedDate = appointmentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      PushNotification.localNotificationSchedule({
        channelId: 'pet-appointments',
        id: appointmentId,
        title: 'Appointment Reminder',
        message: `Reminder: ${petName} has a ${appointmentType} appointment tomorrow on ${formattedDate}.`,
        date: reminderDate,
        allowWhileIdle: true, // Show notification even when app is closed
        playSound: true,
        soundName: 'default',
        importance: 'high',
        priority: 'high',
      });

      // Also schedule a notification on the day of appointment (3 hours before)
      const dayOfReminder = new Date(appointmentDate);
      dayOfReminder.setHours(dayOfReminder.getHours() - 3);

      // Only schedule if it's in the future
      if (dayOfReminder > new Date()) {
        PushNotification.localNotificationSchedule({
          channelId: 'pet-appointments',
          id: `${appointmentId}-same-day`,
          title: 'Appointment Today',
          message: `Don't forget: ${petName}'s ${appointmentType} appointment is today at ${appointmentDate.toLocaleTimeString(
            [],
            {hour: '2-digit', minute: '2-digit'},
          )}.`,
          date: dayOfReminder,
          allowWhileIdle: true,
          playSound: true,
          soundName: 'default',
          importance: 'high',
          priority: 'high',
        });
      }
    }
  };

  // Cancel a specific notification by ID
  cancelNotification = notificationId => {
    PushNotification.cancelLocalNotification(notificationId);
  };

  // Cancel all notifications
  cancelAllNotifications = () => {
    PushNotification.cancelAllLocalNotifications();
  };
}

const notificationService = new NotificationService();
export default notificationService;
