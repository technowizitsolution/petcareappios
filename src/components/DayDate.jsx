import React, {useState} from 'react';
import {Text, StyleSheet, TouchableOpacity, ScrollView} from 'react-native';

const DayDate = ({onDateSelect}) => {
  const getCurrentDayPlusTwo = () => {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 2); // Add 2 days to the current date
    const day = daysOfWeek[currentDate.getDay()];
    const date = currentDate.getDate();

    // Create a full date object for passing to the form
    return {
      displayText: `${day} ${date}`,
      fullDate: currentDate,
    };
  };

  const generateDaysArray = () => {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentDate = new Date();
    const daysArray = [];

    for (let i = 0; i < 30; i++) {
      const futureDate = new Date(currentDate);
      futureDate.setDate(currentDate.getDate() + i);
      const day = daysOfWeek[futureDate.getDay()];
      const date = futureDate.getDate();

      // Create a full date object for each day
      daysArray.push({
        displayText: `${day} ${date}`,
        fullDate: futureDate,
      });
    }

    return daysArray;
  };

  const [selectedDay, setSelectedDay] = useState(getCurrentDayPlusTwo());
  const days = generateDaysArray();

  const handleDaySelect = day => {
    setSelectedDay(day);
    // Call the onDateSelect prop with the full date
    if (onDateSelect) {
      onDateSelect(day.fullDate);
    }
  };

  return (
    <>
      <Text style={styles.subtitle}>Schedule</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.daysContainer}>
        {days.map((day, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.day,
              selectedDay.displayText === day.displayText
                ? styles.selectedDay
                : null,
            ]}
            onPress={() => handleDaySelect(day)}>
            <Text
              style={[
                styles.dayText,
                selectedDay.displayText === day.displayText
                  ? styles.selectedDayText
                  : null,
              ]}>
              {day.displayText}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  daysContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  day: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F7F7F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  selectedDayContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  selectedDay: {
    backgroundColor: '#FB6A43',
  },
  dayText: {
    fontSize: 12,
    color: '#333',
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default DayDate;
