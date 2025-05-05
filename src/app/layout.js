// src/app/layout.js
import { Providers } from './providers';
import './globals.css';

export const metadata = {
  title: 'Fikipedia - The Free Fictional Encyclopedia',
  description: 'Create and explore fictional wikis, alternate histories, and imaginary worlds.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}