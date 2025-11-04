'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/useAuth';
import { API_BASE_URL } from '@/lib/api';
import toast from 'react-hot-toast';

interface TwilioVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTwilioNumber: string;
}

interface CountryCode {
  name: string;
  code: string;
}

const getCountryCodeFromPhoneNumber = (phoneNumber: string, countryCodes: CountryCode[]): string => {
  for (const country of countryCodes) {
    if (phoneNumber.startsWith(country.code)) {
      return country.code;
    }
  }
  return '+1'; // Default to +1 if no match
};

export const TwilioVerificationModal: React.FC<TwilioVerificationModalProps> = ({ isOpen, onClose, currentTwilioNumber }) => {
  const { user, fetchUser } = useAuth();
  const [twilioNumber, setTwilioNumber] = useState('');
  const [selectedCountryCode, setSelectedCountryCode] = useState('+1');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [countryCodes, setCountryCodes] = useState<CountryCode[]>([]);
  const [loadingCountryCodes, setLoadingCountryCodes] = useState(true);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false); // State for country code dropdown
  const countryCodeDropdownRef = useRef<HTMLDivElement>(null); // Ref for country code dropdown

  useEffect(() => {
    const fetchCountryData = async () => {
      try {
        const res = await fetch('https://restcountries.com/v3.1/all?fields=name,idd');
        const data = await res.json();
        const codes: CountryCode[] = data.map((country: any) => ({
          name: country.name.common,
          code: country.idd.root + (country.idd.suffixes ? country.idd.suffixes[0] : '')
        })).filter((c: CountryCode) => c.code !== '+'); // Filter out invalid codes
        setCountryCodes(codes.sort((a, b) => a.name.localeCompare(b.name)));
      } catch (err) {
        console.error('Failed to fetch country codes:', err);
        toast.error('Failed to load country codes.');
      } finally {
        setLoadingCountryCodes(false);
      }
    };

    fetchCountryData();
  }, []);

  useEffect(() => {
    if (isOpen && !loadingCountryCodes) {
      setOtp('');
      setMessage('');
      setError('');
      setOtpSent(false);
      setSearchTerm('');

      if (currentTwilioNumber) {
        const code = getCountryCodeFromPhoneNumber(currentTwilioNumber, countryCodes);
        setSelectedCountryCode(code);
        setTwilioNumber(currentTwilioNumber.substring(code.length));
      } else {
        setSelectedCountryCode('+1');
        setTwilioNumber('');
      }
    }
  }, [isOpen, currentTwilioNumber, countryCodes, loadingCountryCodes]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryCodeDropdownRef.current && !countryCodeDropdownRef.current.contains(event.target as Node)) {
        setIsCountryDropdownOpen(false);
        setSearchTerm(''); // Clear search term when dropdown closes
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isCountryDropdownOpen && event.key.length === 1 && event.key.match(/[a-zA-Z0-9]/)) {
        setSearchTerm((prev) => prev + event.key);
      } else if (isCountryDropdownOpen && event.key === 'Backspace') {
        setSearchTerm((prev) => prev.slice(0, -1));
      } else if (isCountryDropdownOpen && event.key === 'Escape') {
        setIsCountryDropdownOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [countryCodeDropdownRef, isCountryDropdownOpen]);

  if (!isOpen) return null;

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const fullTwilioNumber = selectedCountryCode + twilioNumber;

    if (!fullTwilioNumber) {
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
        body: JSON.stringify({ twilioNumber: fullTwilioNumber }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        setOtpSent(true);
        toast.success(data.message);
      } else {
        setError(data.message || 'Failed to request OTP.');
        toast.error(data.message || 'Failed to request OTP.');
      }
    } catch (err) {
      console.error('Request OTP error:', err);
      setError('An unexpected error occurred.');
      toast.error('An unexpected error occurred.');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const fullTwilioNumber = selectedCountryCode + twilioNumber;

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
        body: JSON.stringify({ twilioNumber: fullTwilioNumber, otp }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        await fetchUser(); // Re-fetch user data to update verification status
        toast.success(data.message);
        onClose(); // Close modal on successful verification
      } else {
        setError(data.message || 'Failed to verify OTP.');
        toast.error(data.message || 'Failed to verify OTP.');
      }
    } catch (err) {
      console.error('Verify OTP error:', err);
      setError('An unexpected error occurred.');
      toast.error('An unexpected error occurred.');
    }
  };

  const filteredCountryCodes = countryCodes.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.code.includes(searchTerm)
  );

  return (
    <div className="fixed inset-0 backdrop-blur-sm overflow-y-auto h-full w-full flex justify-center items-center z-50">
      <div className="relative p-8 border w-full max-w-md md:max-w-lg shadow-lg rounded-md bg-white">
        <h3 className="text-2xl font-bold text-center mb-6 text-black">Verify Twilio Number</h3>
        <button
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 text-xl"
          onClick={onClose}
        >
          &times;
        </button>

        {!otpSent ? (
          <form onSubmit={handleRequestOtp}>
            <div className="mb-4">
              <div className="flex border rounded shadow appearance-none w-full focus-within:outline-none focus-within:shadow-outline">
                {loadingCountryCodes ? (
                  <div className="p-2 text-gray-500">Loading...</div>
                ) : (
                  <div className="relative" ref={countryCodeDropdownRef}>
                    <button
                      type="button"
                      className="flex items-center py-2 px-3 text-gray-900 leading-tight focus:outline-none bg-transparent border-r"
                      onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                    >
                      <span>{selectedCountryCode}</span>
                      <svg className={`w-4 h-4 ml-2 transition-transform ${isCountryDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </button>
                    {isCountryDropdownOpen && (
                      <div key={searchTerm} className="absolute left-0 mt-1 w-64 bg-white border rounded-md shadow-lg py-1 z-20 max-h-60 overflow-y-auto"> {/* Increased width to w-64 */}
                        <input
                          type="text"
                          placeholder="Search country codes..."
                          className="block w-full py-2 px-3 text-gray-900 placeholder-gray-500 leading-tight focus:outline-none border-b"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          onClick={(e) => e.stopPropagation()} // Prevent dropdown from closing when clicking search input
                        />
                        {filteredCountryCodes.map((country) => (
                          <button
                            key={`${country.code}-${country.name}`}
                            type="button"
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => {
                              setSelectedCountryCode(country.code);
                              setIsCountryDropdownOpen(false);
                              setSearchTerm(''); // Clear search term on selection
                            }}
                          >
                            {country.name} ({country.code})
                          </button>
                        ))}
                        {filteredCountryCodes.length === 0 && (
                          <div className="px-4 py-2 text-sm text-gray-500">No matching countries</div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                <input
                  type="text"
                  id="twilioNumber"
                  className="flex-1 py-2 px-3 text-gray-900 leading-tight focus:outline-none bg-transparent"
                  value={twilioNumber}
                  onChange={(e) => setTwilioNumber(e.target.value)}
                  placeholder="Mobile Number"
                  required
                />
              </div>
            </div>
            {error && <p className="text-red-700 text-sm italic mb-4">{error}</p>}
            {message && <p className="text-green-700 text-sm italic mb-4">{message}</p>}
            <button
              type="submit"
              className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            >
              Request OTP via WhatsApp
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <div className="mb-4 text-center">
              <p className="text-gray-700 text-sm mb-2">
                OTP sent to <span className="font-bold">{selectedCountryCode}{twilioNumber}</span>
              </p>
              <button
                type="button"
                onClick={() => setOtpSent(false)}
                className="text-blue-600 hover:text-blue-800 text-sm underline mb-4 focus:outline-none"
              >
                Change Number
              </button>
            </div>
            <div className="mb-4">
              <label htmlFor="otp" className="block text-gray-700 text-sm font-bold mb-2">
                OTP
              </label>
              <input
                type="text"
                id="otp"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:shadow-outline"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-red-700 text-sm italic mb-4">{error}</p>}
            {message && <p className="text-green-700 text-sm italic mb-4">{message}</p>}
            <button
              type="submit"
              className="bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            >
              Verify OTP
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
