'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/useAuth';
import { API_BASE_URL } from '../../lib/api';

const VerifyTwilioPage: React.FC = () => {
  const { user, loading, isAuthenticated, fetchUser } = useAuth();
  const router = useRouter();

  const [twilioNumber, setTwilioNumber] = useState(user?.twilioNumber || '');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated && user?.isTwilioVerified) {
      router.push('/');
    } else if (!loading && isAuthenticated && user?.twilioNumber) {
      setTwilioNumber(user.twilioNumber);
    }
  }, [loading, isAuthenticated, user, router]);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!twilioNumber) {
      setError('Please enter your Twilio number.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/auth/request-twilio-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ twilioNumber }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        setOtpSent(true);
      } else {
        setError(data.message || 'Failed to request OTP.');
      }
    } catch (err) {
      console.error('Request OTP error:', err);
      setError('An unexpected error occurred.');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!otp) {
      setError('Please enter the OTP.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/auth/verify-twilio-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ twilioNumber, otp }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        await fetchUser(); // Re-fetch user data to update verification status
        router.push('/');
      } else {
        setError(data.message || 'Failed to verify OTP.');
      }
    } catch (err) {
      console.error('Verify OTP error:', err);
      setError('An unexpected error occurred.');
    }
  };

  if (loading || (isAuthenticated && user?.isTwilioVerified)) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Verify Twilio Number</h2>
        {!otpSent ? (
          <form onSubmit={handleRequestOtp}>
            <div className="mb-4">
              <label htmlFor="twilioNumber" className="block text-gray-700 text-sm font-bold mb-2">
                Twilio Number (e.g., +1234567890)
              </label>
              <input
                type="text"
                id="twilioNumber"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={twilioNumber}
                onChange={(e) => setTwilioNumber(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
            {message && <p className="text-green-500 text-xs italic mb-4">{message}</p>}
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            >
              Request OTP via WhatsApp
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <div className="mb-4">
              <label htmlFor="otp" className="block text-gray-700 text-sm font-bold mb-2">
                OTP
              </label>
              <input
                type="text"
                id="otp"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
            {message && <p className="text-green-500 text-xs italic mb-4">{message}</p>}
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            >
              Verify OTP
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default VerifyTwilioPage;
