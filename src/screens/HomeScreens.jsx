import {BlurView} from '@react-native-community/blur';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Carousel from '../components/Carousel';
import Services from '../components/Services';
import SearchBar from '../components/SearchBar';
import {useNavigation} from '@react-navigation/native';

const BGWidth = Dimensions.get('screen').width;

const HomeScreen = () => {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={{flex: 1}} edges={['top', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Search Bar */}
          <SearchBar />

          {/* Banner Section */}
          <Carousel />

          {/* Services Section */}
          <Services />

          {/* Image Card Section */}
          <View
            style={{
              width: BGWidth - 20,
              height: 145,
              borderRadius: 20,
              overflow: 'hidden',
              marginBottom: 20,
            }}>
            <ImageBackground
              source={require('../assets/images/bannerHome.png')} // Replace with the path to your background image
              style={styles.backgroundImage}>
              <View style={styles.cardContainer}>
                <BlurView
                  style={StyleSheet.absoluteFill} // Ensure BlurView covers the card
                  blurType="light"
                  blurAmount={20}
                  reducedTransparencyFallbackColor="rgba(255,255,255,0.3)"
                />
                {/* Add your card content */}
                <TouchableOpacity
                  onPress={() => navigation.navigate('TipsScreen')}>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>
                      Take Care of Pet's Health
                    </Text>
                    <Ionicons name="arrow-forward" size={30} color="#fff" />
                  </View>
                </TouchableOpacity>
              </View>
            </ImageBackground>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingHorizontal: 10,
    paddingTop: 10,
  },

  backgroundImage: {
    resizeMode: 'cover',
    borderRadius: 20,
    padding: 20,
    width: BGWidth - 20,
    height: 145,
    marginTop: 10,
    overflow: 'hidden', // Ensures BlurView respects the border radius
  },
  cardContainer: {
    marginHorizontal: 0,
    marginTop: 25,
    marginBottom: 0,
    borderRadius: 20,
    overflow: 'hidden', // Ensures BlurView respects the border radius
    elevation: 5, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOpacity: 0.2,
    shadowOffset: {width: 0, height: 4},
    shadowRadius: 10,
    backgroundColor: 'transparent',
  },
  cardContent: {
    paddingVertical: 20,
    paddingLeft: 20,
    paddingRight: 15,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '500',
    textAlign: 'left',
    marginBottom: 0, // Prevent shadow effects
    color: '#fff',
    backgroundColor: 'transparent',
  },
  cardSubTitle: {
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'left',
    marginBottom: 0, // Prevent shadow effects
    color: '#fff',
    backgroundColor: 'transparent',
  },
});

export default HomeScreen;
