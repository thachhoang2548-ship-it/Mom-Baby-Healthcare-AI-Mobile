import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from './types';

/** Cho phép điều hướng từ ngoài component (VD: khi phiên đăng nhập hết hạn trong axios). */
export const navigationRef = createNavigationContainerRef<RootStackParamList>();
