// Modified Services.jsx
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {useNavigation} from '@react-navigation/native';

const Services = () => {
  const navigation = useNavigation();
  
  // Navigate to the appointment screen with the selected service type
  const navigateToServiceScreen = (serviceType) => {
    // Navigate to specific service screen based on type
    switch(serviceType) {
      case 'Treatment':
        navigation.navigate('TreatmentScreen');
        break;
      case 'Grooming':
        navigation.navigate('GroomingScreen');
        break;
      case 'Surgery':
        navigation.navigate('SurgeryScreen');
        break;
      case 'Vaccination':
        navigation.navigate('VaccinationScreen');
        break;
      default:
        break;
    }
  };
  
  return (
    <View>
      <Text style={styles.servicesTitle}>Explore Our Services</Text>
      <View style={styles.servicesContainer}>
        <TouchableOpacity
          onPress={() => navigateToServiceScreen('Treatment')}
          style={styles.serviceCard}>
          <Image
            source={require('../assets/images/treatment.png')}
            style={styles.serviceImage}
          />
          <Text style={styles.serviceText}>Treatment</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigateToServiceScreen('Grooming')}
          style={styles.serviceCard}>
          <Image
            source={require('../assets/images/grooming.png')}
            style={styles.serviceImage}
          />
          <Text style={styles.serviceText}>Grooming</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.servicesContainer}>
        <TouchableOpacity
          onPress={() => navigateToServiceScreen('Surgery')}
          style={styles.serviceCard}>
          <Image
            source={require('../assets/images/surgery.png')}
            style={styles.serviceImage}
          />
          <Text style={styles.serviceText}>Surgery</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigateToServiceScreen('Vaccination')}
          style={styles.serviceCard}>
          <Image
            source={require('../assets/images/vaccination.png')}
            style={styles.serviceImage}
          />
          <Text style={styles.serviceText}>Vaccination</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Services;

// No changes to the styles

const styles = StyleSheet.create({
  servicesTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 20,
    color: '#333',
  },
  servicesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  serviceCard: {
    flex: 1,
    backgroundColor: '#FB6A43',
    alignItems: 'center',
    borderRadius: 10,
    marginHorizontal: 10,
    paddingVertical: 15,
    elevation: 3,
  },
  serviceImage: {
    width: 130,
    height: 130,
    marginBottom: 10,
  },
  serviceText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
});
