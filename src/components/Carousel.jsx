import {View, Dimensions, StyleSheet, Image} from 'react-native';
import React, {useRef, useState} from 'react';
import CarouselSlider, {Pagination} from 'react-native-snap-carousel';
import {CarouselData} from '../data/CarouselData';

const sliderWidth = Dimensions.get('screen').width;

const Carousel = () => {
  const carouselRef = useRef();
  const [activeSlide, setActiveSlide] = useState(0);
  const autoplayInterval = 3000; // Time between each slide (3 seconds)

  const renderItem = ({item}) => {
    return (
      <View style={styles.slide}>
        <Image source={item.image} style={styles.imgStyle} />
      </View>
    );
  };

  return (
    <View style={styles.carouselContainer}>
      <CarouselSlider
        ref={carouselRef}
        data={CarouselData}
        renderItem={renderItem}
        sliderWidth={sliderWidth}
        itemWidth={sliderWidth * 1} // Adjust item width to be 80% of the screen width
        onSnapToItem={index => setActiveSlide(index)}
        autoplay={true}
        autoplayInterval={autoplayInterval}
        loop={false} // Add extra clones for smoother looping
      />
      <Pagination
        dotsLength={CarouselData.length}
        activeDotIndex={activeSlide}
        containerStyle={{
          margin:-11,
        }}
        dotStyle={{
          width: 10,
          height: 10,
          borderRadius: 5,
        }}
        inactiveDotStyle={{width: 15, height: 15, borderRadius: 10}}
        inactiveDotOpacity={0.4}
        inactiveDotScale={0.6}
        dotColor="#fe690d"
        inactiveDotColor="#fb8817"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  carouselContainer: {
    position: 'relative',
    paddingTop:5,
  },
  imgStyle: {
    height: 400,
    width: sliderWidth - 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius:20,
    marginLeft:0,
  },
});

export default Carousel;
