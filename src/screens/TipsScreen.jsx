import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
  StatusBar,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const tips = [
  {
    id: 1,
    text: 'Your veterinarian is the best source of information regarding which vaccines your dog needs and when they should receive them.',
    image: require('../assets/images/tipsBg.png'), // Replace with your image path
  },
  {
    id: 2,
    text: 'Regular grooming can help your dog feel comfortable and keep their coat healthy.',
    image: require('../assets/images/tipsBg2.jpg'), // Replace with your image path
  },
  {
    id: 3,
    text: 'Always provide fresh and clean water for your pet to stay hydrated.',
    image: require('../assets/images/tipsBg3.jpg'), // Replace with your image path
  },
];

const TipsScreen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const handleTap = (event) => {
    const { locationX } = event.nativeEvent;
    if (locationX < width / 2) {
      // Tap on the left side, go to the previous tip
      setCurrentIndex((prev) => {
        const prevIndex = prev === 0 ? tips.length - 1 : prev - 1;
        flatListRef.current.scrollToIndex({
          index: prevIndex,
          animated: true,
        });
        return prevIndex;
      });
    } else {
      // Tap on the right side, go to the next tip
      setCurrentIndex((prev) => {
        const nextIndex = (prev + 1) % tips.length;
        flatListRef.current.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
        return nextIndex;
      });
    }
  };

  useEffect(() => {
    // Auto-slide every 3 seconds
    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        const nextIndex = (prev + 1) % tips.length;

        flatListRef.current.scrollToIndex({
          index: nextIndex,
          animated: true,
        });

        return nextIndex;
      });
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.slide}>
      <Image source={item.image} style={styles.image} />
      <View style={styles.overlay}>
        <Text style={styles.tipText}>{item.text}</Text>
      </View>
    </View>
  );

  return (
    <>
      <TouchableWithoutFeedback onPress={handleTap}>
        <View style={styles.container}>
          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            {tips.map((_, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.progressBar,
                  index < currentIndex
                    ? styles.completedProgressBar
                    : index === currentIndex
                    ? styles.activeProgressBar
                    : null,
                ]}
              />
            ))}
          </View>

          {/* Slider */}
          <FlatList
            ref={flatListRef}
            data={tips}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) =>
              setCurrentIndex(Math.round(event.nativeEvent.contentOffset.x / width))
            }
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
          />
        </View>
      </TouchableWithoutFeedback>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  closeButton: {
    position: 'absolute',
    top: 55,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 18,
    color: '#333',
  },
  progressBarContainer: {
    position: 'absolute',
    top: 40,
    flexDirection: 'row',
    width: '90%',
    alignSelf: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  progressBar: {
    height: 3,
    flex: 1,
    backgroundColor: '#ccc',
    marginHorizontal: 2,
    borderRadius: 2,
  },
  completedProgressBar: {
    backgroundColor: '#fff',
  },
  activeProgressBar: {
    backgroundColor: '#ff9800',
  },
  slide: {
    width: width,
    height: height,
    justifyContent: 'flex-end',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    position: 'absolute',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
    width: '100%',
    alignItems: 'center',
  },
  tipText: {
    color: '#fff',
    fontSize: 17,
    textAlign: 'center',
    letterSpacing: 0.3,
    lineHeight: 25,
    paddingTop: 20,
    paddingBottom: 30,
  },
});

export default TipsScreen;
