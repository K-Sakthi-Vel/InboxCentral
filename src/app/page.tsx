'use client';

import React, { JSX, useState, useEffect } from 'react';
import ThreadCard from '@/components/ThreadCard';
import MessageList from '@/components/MessageList';
import Composer from '@/components/Composer';
import ContactModal from '@/components/ContactModal';
import { useThreads } from '@/lib/api';
import { useAuth } from '@/lib/useAuth'; // Import useAuth hook

export default function InboxPage(): JSX.Element {
  const { data: threads, isLoading } = useThreads();
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [showContact, setShowContact] = useState(false);
  const { user, isAuthenticated, loading: authLoading, requestTwilioVerification, verifyTwilioNumber } = useAuth();
  const [showTwilioVerification, setShowTwilioVerification] = useState(false);
  const [twilioNumberInput, setTwilioNumberInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [verificationStep, setVerificationStep] = useState<'inputNumber' | 'inputOtp'>('inputNumber');
  const [twilioError, setTwilioError] = useState('');
  const [twilioSuccess, setTwilioSuccess] = useState('');

  useEffect(() => {
    if (!authLoading && isAuthenticated && user && !user.isTwilioVerified) {
      setShowTwilioVerification(true);
      setTwilioNumberInput(user.twilioNumber || ''); // Pre-fill if already exists
    } else {
      setShowTwilioVerification(false);
    }
  }, [authLoading, isAuthenticated, user]);

  const handleRequestOtp = async () => {
    setTwilioError('');
    setTwilioSuccess('');
    if (!twilioNumberInput) {
      setTwilioError('Please enter your Twilio number.');
      return;
    }
    const result = await requestTwilioVerification(twilioNumberInput);
    if (result.success) {
      setTwilioSuccess(result.message);
      setVerificationStep('inputOtp');
    } else {
      setTwilioError(result.message);
    }
  };

  const handleVerifyOtp = async () => {
    setTwilioError('');
    setTwilioSuccess('');
    if (!otpInput) {
      setTwilioError('Please enter the OTP.');
      return;
    }
    const result = await verifyTwilioNumber(twilioNumberInput, otpInput);
    if (result.success) {
      setTwilioSuccess(result.message);
      setShowTwilioVerification(false); // Close modal on success
    } else {
      setTwilioError(result.message);
    }
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100">Loading user session...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 h-[calc(100vh-120px)]">
      {showTwilioVerification && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-auto">
            <h3 className="text-2xl font-bold text-center mb-6 text-gray-800">Verify Your Twilio Number</h3>
            {twilioError && <p className="text-red-500 text-center mb-4">{twilioError}</p>}
            {twilioSuccess && <p className="text-green-500 text-center mb-4">{twilioSuccess}</p>}

            {verificationStep === 'inputNumber' ? (
              <>
                <p className="text-gray-600 text-center mb-4">
                  Please enter your Twilio-enabled WhatsApp number to receive a verification code.
                </p>
                <div className="mb-4">
                  <label htmlFor="twilioNumber" className="block text-gray-700 text-sm font-bold mb-2">
                    Twilio Number (e.g., +12345678900)
                  </label>
                  <input
                    type="text"
                    id="twilioNumber"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={twilioNumberInput}
                    onChange={(e) => setTwilioNumberInput(e.target.value)}
                    placeholder="+12345678900"
                    required
                  />
                </div>
                <button
                  onClick={handleRequestOtp}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                >
                  Request OTP
                </button>
              </>
            ) : (
              <>
                <p className="text-gray-600 text-center mb-4">
                  An OTP has been sent to your WhatsApp number ({twilioNumberInput}). Please enter it below.
                </p>
                <div className="mb-4">
                  <label htmlFor="otp" className="block text-gray-700 text-sm font-bold mb-2">
                    OTP
                  </label>
                  <input
                    type="text"
                    id="otp"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    required
                  />
                </div>
                <button
                  onClick={handleVerifyOtp}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                >
                  Verify OTP
                </button>
                <button
                  onClick={() => setVerificationStep('inputNumber')}
                  className="mt-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                >
                  Change Number
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Left Column: Threads and Quick Actions (Now combined into one full-height column) */}
      <div className="flex flex-col gap-6"> 
          
        {/* Top of Left: Threads */}
        <aside className="bg-white shadow-md rounded-xl p-4 flex flex-col flex-1">
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <h2 className="text-lg font-semibold text-gray-800">Threads</h2>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              New
            </button>
          </div>

          {isLoading ? (
            <div className="text-center text-gray-500 py-10">Loading threads...</div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {threads?.map((t: { id: any; contactName?: string | null | undefined; snippet?: string | null | undefined; unread?: number | null | undefined; updatedAt?: string | null | undefined; channel?: string | null | undefined; }) => (
                <ThreadCard
                  key={t.id}
                  thread={t}
                  isSelected={t.id === selectedThreadId}
                  onClick={() => setSelectedThreadId(t.id)}
                />
              )) ?? <div className="text-center text-gray-500 py-10">No threads yet</div>}
            </div>
          )}
        </aside>

        {/* Bottom of Left: Quick Actions */}
        {/* We keep this as a separate aside/div to stack it visually, it doesn't need to be h-full now */}
        <aside className="bg-white shadow-md rounded-xl p-4 flex flex-col flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="text-sm text-gray-600 mb-6">Contact preview and analytics will appear here.</div>
          <div>
            <button
              className="w-full px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
              onClick={() => alert('Analytics not yet implemented')}
            >
              View Analytics
            </button>
          </div>
        </aside>
      </div>

      {/* Right Column: Messages (Full Height and fills remaining space) */}
      <section className="bg-white shadow-md rounded-xl p-6 flex flex-col h-full">
        {selectedThreadId ? (
          <>
            {/* Header: Fixed height top section - Added flex-shrink-0 */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4 flex-shrink-0">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Thread with Contact</h3>
                <div className="text-sm text-gray-500">contact@example.com · WhatsApp</div>
              </div>
              <div>
                <button
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
                  onClick={() => setShowContact(true)}
                >
                  View Contact
                </button>
              </div>
            </div>

            {/* Message List: Flexible section - has flex-1 to grow */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              <MessageList threadId={selectedThreadId} />
            </div>

            {/* Composer: Fixed height bottom section - Added flex-shrink-0 */}
            <div className="mt-6 flex-shrink-0">
              <Composer threadId={selectedThreadId} />
            </div>
          </>
        ) : (
          <div className="text-center text-gray-500 py-20 text-lg">Select a thread to view messages</div>
        )}
      </section>

      <ContactModal open={showContact} onClose={() => setShowContact(false)} />
    </div>
  );
}
