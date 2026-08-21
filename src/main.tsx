/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import { esES } from '@clerk/localizations';
import { AuthProvider } from '@/src/contexts/AuthContext';
import App from './App.tsx';
import './index.css';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_ZW5vdWdoLXN1bmJpcmQtMTEyNy5jbGVyay5hY2NvdW50cy5kZXYk';

if (!clerkPubKey) {
  throw new Error("Missing Publishable Key for Clerk");
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={clerkPubKey} localization={esES}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ClerkProvider>
  </StrictMode>,
);
