import React, { StrictMode, Component } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App.tsx';
import './index.css';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY environment variable');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      afterSignOutUrl="/"
      appearance={{
        variables: {
          colorPrimary: '#FF3B00',
          colorBackground: '#0D0D0D',
          colorInputBackground: '#171717',
          colorInputText: '#FFFFFF',
          colorText: '#FFFFFF',
          colorTextSecondary: '#E5E5E5',
          colorTextOnPrimaryBackground: '#FFFFFF',
          colorDanger: '#EF4444',
          borderRadius: '0.375rem',
          fontFamily: "'Space Grotesk', 'Inter', sans-serif",
        },
        elements: {
          modalContent: 'bg-[#0D0D0D] border border-[#262626] shadow-2xl rounded-lg text-white',
          modalBackdrop: 'backdrop-blur-sm bg-black/80',
          card: 'bg-[#0D0D0D] border border-[#262626] shadow-2xl rounded-lg text-white',
          headerTitle: 'text-white font-bold uppercase tracking-wider text-lg',
          headerSubtitle: 'text-neutral-300 text-xs',
          socialButtonsBlockButton: {
            backgroundColor: '#171717',
            borderColor: '#262626',
            color: '#FFFFFF !important',
            '&:hover': {
              backgroundColor: '#262626',
              borderColor: '#FF3B00',
            },
          },
          socialButtonsBlockButtonText: {
            color: '#FFFFFF !important',
            fontWeight: 600,
            fontSize: '14px',
          },
          socialButtonsIconButton: {
            color: '#FFFFFF !important',
          },
          dividerLine: 'bg-[#262626]',
          dividerText: 'text-neutral-400 uppercase text-xs tracking-widest font-semibold',
          formFieldLabel: 'text-neutral-200 uppercase text-xs tracking-wider font-semibold',
          formFieldInput:
            'bg-[#171717] border border-[#262626] text-white focus:border-[#FF3B00] focus:ring-1 focus:ring-[#FF3B00] rounded transition-all',
          formButtonPrimary:
            'bg-[#FF3B00] hover:bg-[#FF5511] text-white font-bold uppercase tracking-wider py-2.5 shadow-md shadow-[#FF3B00]/20 transition-all cursor-pointer border-none',
          footerActionLink: 'text-[#FF3B00] hover:text-[#FF5511] font-semibold transition-colors',
          footerActionText: 'text-neutral-300',
          identityPreview: 'bg-[#171717] border border-[#262626]',
          identityPreviewText: 'text-white',
          identityPreviewEditButton: 'text-[#FF3B00] hover:text-[#FF5511]',
          userButtonPopoverCard: 'bg-[#0D0D0D] border border-[#262626] text-white shadow-2xl',
          userButtonPopoverActionButton: 'text-white hover:bg-[#171717] hover:text-[#FF3B00] transition-colors',
          userButtonPopoverActionButtonText: 'text-neutral-200',
          userButtonPopoverFooter: 'hidden',
        },
      }}
    >
      <App />
    </ClerkProvider>
  </StrictMode>,
);
