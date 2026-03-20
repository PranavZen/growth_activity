import React from 'react';
import { StyleSheet } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';
import RootNavigator from './src/navigation';
import { persistor, store } from './src/redux/store';

enableScreens();

const App: React.FC = () => (
  <Provider store={store}>
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <PersistGate loading={null} persistor={persistor}>
          <RootNavigator />
        </PersistGate>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  </Provider>
);

const styles = StyleSheet.create({
  root: { flex: 1 },
});

export default App;
