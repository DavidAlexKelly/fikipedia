// /lib/server/server-only.js
import { headers } from 'next/headers';

/**
 * Ensures a function is only called on the server
 * @param {Function} fn The function to wrap
 * @returns {Function} The wrapped function
 */
export function serverOnly(fn) {
  return (...args) => {
    try {
      // This will throw an error if called from client components
      headers();
      return fn(...args);
    } catch (error) {
      throw new Error('This function can only be called on the server');
    }
  };
}