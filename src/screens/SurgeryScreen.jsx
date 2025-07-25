import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  StatusBar,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import BottomBookButton from '../components/BottomBookButton';
import DayDate from '../components/DayDate';

const SurgeryScreen = () => {
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState(null);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    // Optionally, you can log or do something with the selected date
    console.log('Selected Date:', date);
  };

  return (
    <>
      <StatusBar
        translucent={true}
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Service Image */}
        <ImageBackground
          source={require('../assets/images/surgery1.png')} // Replace with the path to your background image
          style={styles.serviceImage}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}>
              <Ionicons name="arrow-undo" size={20} color="#0F0F0F" />
            </TouchableOpacity>
            {/* <TouchableOpacity style={styles.menuButton}>
              <Entypo name="dots-three-vertical" size={20} color="#0F0F0F" />
            </TouchableOpacity> */}
          </View>
        </ImageBackground>

        {/* Service Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.title}>Surgery</Text>
          <View style={styles.tagsContainer}>
            <Text style={styles.tag}>Pet behavior</Text>
            <Text style={styles.tag}>Pet Food</Text>
            <Text style={styles.tag}>Pet Treatments</Text>
          </View>
          <View style={styles.ratingContainer}>
            {Array(5)
              .fill(null)
              .map((_, index) => (
                <View key={index} style={styles.paw}>
                  <Ionicons name="paw" size={25} color="#FB6A43" />
                </View>
              ))}
          </View>
          
          <DayDate onDateSelect={handleDateSelect} />
          
          <Text style={styles.description}>
            Pet care team is a highly experienced veterinarian with 11 years of
            dedicated practice, showcasing a professional approach to your pet's
            Surgery needs...
          </Text>
        </View>

        {/* Footer Actions */}
        <BottomBookButton serviceType="Surgery" selectedDate={selectedDate}/>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFDFD',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 10,
    borderRadius: 50,
  },
  menuButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 10,
    borderRadius: 50,
  },
  arrow: {
    fontSize: 18,
  },
  dots: {
    fontSize: 18,
  },
  serviceImage: {
    width: '100%',
    height: 430,
    resizeMode: 'cover',
    paddingTop: 20,
  },
  detailsContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -30,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: '#333',
    marginBottom: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  tag: {
    backgroundColor: '#FFD8CE',
    color: '#FB6A43',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    fontSize: 12,
    marginHorizontal: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  paw: {
    marginHorizontal: 2,
  },
  description: {
    fontSize: 18,
    color: '#808080',
    marginBottom: 20,
    letterSpacing: 0.5,
    lineHeight: 25,
  },
});

export default SurgeryScreen;
