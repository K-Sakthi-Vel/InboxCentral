'use client';

import React, { JSX, useState, useEffect } from 'react';
import ThreadCard from '@/components/ThreadCard';
import MessageList from '@/components/MessageList';
import UserIcon from './UserIcon';
import Composer from '@/components/Composer';
import ContactModal from '@/components/ContactModal';
import { useThreads, useMessages } from '@/lib/api';
import { useAuth } from '@/lib/useAuth'; // Import useAuth hook
import { TwilioVerificationModal } from '@/components/TwilioVerificationModal'; // Import the TwilioVerificationModal

export default function UnifiedInbox(): JSX.Element {
  const { data: threads, isLoading } = useThreads();
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const { data: messages } = useMessages(selectedThreadId ?? '');
  const selectedThread = threads?.find(t => t.id === selectedThreadId);
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

  // Automatically select the first thread if available
  useEffect(() => {
    if (Array.isArray(threads) && threads.length > 0 && !selectedThreadId) {
      setSelectedThreadId(threads[0].id);
    }
  }, [threads, selectedThreadId]);

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
    <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-3 h-[calc(100vh-90px)]">
      {showTwilioVerification && (
        <TwilioVerificationModal
          isOpen={showTwilioVerification}
          onClose={() => setShowTwilioVerification(false)}
          currentTwilioNumber={twilioNumberInput}
        />
      )}

      {/* Left Column: Threads and Quick Actions (Now combined into one full-height column) */}
      <div className="flex flex-col gap-6 h-[calc(100vh-90px)]"> 
          
        {/* Top of Left: Threads */}
        <aside className="bg-white shadow-md rounded-xl p-4 flex flex-col flex-1">
          <div className="flex items-center justify-between mb-4 flex-shrink-0 border-b border-gray-300 ">
            <h2 className="text-lg font-semibold text-gray-800">Threads</h2>
          </div>

          {isLoading ? (
            <div className="text-center text-gray-500 py-10">Loading threads...</div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {Array.isArray(threads) && threads.length > 0 ? (
                threads.map((t: { id: any; contactName?: string | null | undefined; snippet?: string | null | undefined; unread?: number | null | undefined; updatedAt?: string | null | undefined; channel?: string | null | undefined; }) => (
                  <ThreadCard
                    key={t.id}
                    thread={t}
                    isSelected={t.id === selectedThreadId}
                    onClick={() => setSelectedThreadId(t.id)}
                  />
                ))
              ) : (
                <div className="text-center text-gray-500 py-10">No threads yet</div>
              )}
            </div>
          )}
        </aside>
      </div>

      {/* Right Column: Messages (Full Height and fills remaining space) */}
      <section className="bg-white shadow-md rounded-xl p-6 flex flex-col h-[calc(100vh-90px)]">
        {Array.isArray(threads) && threads.length > 0 ? (
          selectedThreadId ? (
            <>
              {/* Header: Fixed height top section - Added flex-shrink-0 */}
              <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4 flex-shrink-0">
                <div className="flex items-center">
                  <UserIcon className="h-10 w-10 text-gray-400 mr-3" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{selectedThread?.contactName}</h3>
                    <div className="text-sm text-gray-500">{messages?.length} messages · {selectedThread?.channel}</div>
                  </div>
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
              <div className="flex-1 overflow-y-auto">
                <MessageList threadId={selectedThreadId} messages={messages} />
              </div>

              {/* Composer: Fixed height bottom section - Added flex-shrink-0 */}
              <div className="mt-6 flex-shrink-0">
                <Composer threadId={selectedThreadId} initialChannel={threads?.find(t => t.id === selectedThreadId)?.channel || 'SMS'} />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <img src="/file.svg" alt="Loading threads" className="h-24 w-24 mb-4 animate-pulse" />
              <p className="text-lg font-semibold">Loading threads...</p>
              <p className="text-sm">Please wait while we fetch your conversations.</p>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <img src="/file.svg" alt="No threads" className="h-24 w-24 mb-4" />
            <p className="text-lg font-semibold">No threads available</p>
            <p className="text-sm">Start a new conversation to see messages here.</p>
          </div>
        )}
      </section>

      <ContactModal open={showContact} onClose={() => setShowContact(false)} />
    </div>
  );
}
