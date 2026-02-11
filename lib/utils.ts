import { NextResponse } from 'next/server';

/**
 * Format duration in seconds to MM:SS format
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Create a standardized error response for API routes
 */
export function errorResponse(message: string, error: unknown, status = 500) {
  if (process.env.NODE_ENV === 'development') {
    console.error(message, error);
  }
  return NextResponse.json(
    { error: message },
    { status }
  );
}

/**
 * Application constants
 */
export const CONNECTED_THRESHOLD_MS = 30 * 1000; // 30 seconds
export const MAX_BUFFER_SIZE = 10 * 1024 * 1024; // 10MB
export const DAYS_IN_WEEK = 7;
