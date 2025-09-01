import '@testing-library/jest-native/extend-expect';
jest.mock('expo/src/winter/runtime.native.ts', () => require('./__mocks__/expo-winter-runtime.js'));

global.__DEV__ = true;