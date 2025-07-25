import { StatusBar, PermissionsAndroid } from 'react-native';
import React, { useEffect } from 'react';
import Router from './src/navigation/Router';

const App = () => {
  useEffect(() => {
    const requestPermissions = async () => {
      await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    };

    requestPermissions();
  }, []);

  return (
    <>
      <StatusBar
        translucent={true}
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      <Router />
    </>
  );
};

export default App;
