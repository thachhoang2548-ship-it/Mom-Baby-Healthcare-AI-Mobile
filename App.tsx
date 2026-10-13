import React, { useEffect } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Alert, StyleSheet, Text, View } from 'react-native';
import RootNavigator from './src/navigation/RootNavigator';
import { navigationRef } from './src/navigation/navigationRef';
import { setSessionExpiredHandler } from './src/api/axiosClient';
import { useAuthStore } from './src/stores/authStore';
import { COLORS } from './src/theme/colors';

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: COLORS.primaryLight,
    card: COLORS.white,
    primary: COLORS.primary,
    text: COLORS.textDark,
    border: COLORS.border,
  },
};

type ErrorBoundaryState = {
  error: Error | null;
};

class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('[App] Render failed', error);
  }

  render() {
    if (this.state.error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>App failed to start</Text>
          <Text style={styles.errorMessage}>{this.state.error.message}</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  useEffect(() => {
    // Refresh token hết hạn (hoặc tài khoản vừa đăng nhập ở thiết bị khác): đưa mẹ về màn đăng nhập.
    setSessionExpiredHandler(() => {
      if (!useAuthStore.getState().isAuthenticated) return;
      useAuthStore.getState().clearSession();
      if (navigationRef.isReady()) {
        navigationRef.reset({ index: 0, routes: [{ name: 'Login' }] });
      }
      Alert.alert('Phiên đăng nhập đã hết hạn', 'Mẹ vui lòng đăng nhập lại để tiếp tục nhé.');
    });
    return () => setSessionExpiredHandler(null);
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider style={styles.root}>
        <NavigationContainer ref={navigationRef} theme={navigationTheme}>
          <RootNavigator />
        </NavigationContainer>
        <StatusBar style="dark" />
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.primaryLight,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: COLORS.primaryLight,
  },
  errorTitle: {
    color: COLORS.textDark,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
});
