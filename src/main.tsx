import React from 'react';
import ReactDOM from 'react-dom/client';
import { TDSMobileProvider } from '@toss/tds-mobile';
import { TDSMobileAITProvider } from '@toss/tds-mobile-ait';
import { App } from './App';
import './index.css';

const ua = typeof window !== 'undefined' ? window.navigator.userAgent : '';

// TDSMobileAITProvider는 토스 네이티브 브릿지가 있어야 동작해요.
// 일반 브라우저(로컬 개발)에서는 TDSMobileProvider로 fallback해요.
const isTossApp = ua.includes('TossApp');

function Root() {
  if (isTossApp) {
    return (
      <TDSMobileAITProvider userAgent={ua}>
        <App />
      </TDSMobileAITProvider>
    );
  }
  return (
    <TDSMobileProvider userAgent={{ fontA11y: undefined, fontScale: undefined, isAndroid: false, isIOS: false }}>
      <App />
    </TDSMobileProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
