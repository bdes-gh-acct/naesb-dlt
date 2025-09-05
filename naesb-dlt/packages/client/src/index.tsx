import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from 'AuthProvider';
import { Mutating } from '@common/loading/Mutating';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'index.css';

const queryClient = new QueryClient();
const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <Router>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <Mutating />
        <App />
      </QueryClientProvider>
    </AuthProvider>
  </Router>,
  document.getElementById('root'),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
