import React from 'react';
import { ConfigProvider, theme } from 'antd';
import './shared/styles.css';
import { MiniApp } from './app/MiniApp';
import { NavigationProvider } from './app/navigation/NavigationProvider';
export default function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#c1f36a',
          colorBgBase: '#101111',
          colorTextBase: '#f3f1e8',
          fontFamily: 'Arial, Helvetica, sans-serif',
          borderRadius: 12,
        },
      }}
    >
      <NavigationProvider>
        <MiniApp />
      </NavigationProvider>
    </ConfigProvider>
  );
}
