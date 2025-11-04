'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard() {

  const messagesData = [
    { name: 'Mon', sent: 4000, received: 2400 },
    { name: 'Tue', sent: 3000, received: 1398 },
    { name: 'Wed', sent: 2000, received: 9800 },
    { name: 'Thu', sent: 2780, received: 3908 },
    { name: 'Fri', sent: 1890, received: 4800 },
    { name: 'Sat', sent: 2390, received: 3800 },
    { name: 'Sun', sent: 3490, received: 4300 },
  ];

  const messageStatusData = [
    { name: 'Sent', value: 500 },
    { name: 'Delivered', value: 300 },
    { name: 'Failed', value: 100 },
  ];

  const topContactsData = [
    { name: 'John Doe', messages: 50 },
    { name: 'Jane Smith', messages: 45 },
    { name: 'Alice Brown', messages: 30 },
    { name: 'Bob White', messages: 20 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Total Messages Overview</h2>
          <div className="space-y-2">
            <p className="flex justify-between items-center text-gray-700">
              <span>Total Messages Sent:</span>
              <strong className="text-lg">456</strong>
            </p>
            <p className="flex justify-between items-center text-gray-700">
              <span>Total Messages Received:</span>
              <strong className="text-lg">321</strong>
            </p>
            <p className="flex justify-between items-center text-gray-700">
              <span>Average Daily Messages:</span>
              <strong className="text-lg">10</strong>
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Recent Activity</h2>
          <ul className="space-y-2">
            <li className="flex justify-between items-center text-gray-700">
              <span>Message sent to John Doe</span>
              <span className="text-sm text-gray-500">2 hours ago</span>
            </li>
            <li className="flex justify-between items-center text-gray-700">
              <span>New contact added: Jane Smith</span>
              <span className="text-sm text-gray-500">1 day ago</span>
            </li>
            <li className="flex justify-between items-center text-gray-700">
              <span>Message received from Alice Brown</span>
              <span className="text-sm text-gray-500">3 days ago</span>
            </li>
          </ul>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Quick Actions</h2>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-200">
            Send New Message
          </button>
          <button className="bg-green-500 text-white px-4 py-2 rounded-md ml-2 hover:bg-green-600 transition-colors duration-200">
            View All Contacts
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md col-span-full">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Messages Sent/Received (Last 7 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={messagesData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sent" fill="#8884d8" name="Messages Sent" />
              <Bar dataKey="received" fill="#82ca9d" name="Messages Received" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Message Status Distribution</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={messageStatusData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label
              >
                {messageStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Top Contacts by Message Count</h2>
          <ul className="space-y-2">
            {topContactsData.map((contact, index) => (
              <li key={index} className="flex justify-between items-center text-gray-700">
                <span>{contact.name}</span>
                <span className="font-semibold">{contact.messages}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Active Conversations</h2>
          <ul className="space-y-2">
            <li className="flex justify-between items-center text-gray-700">
              <span>John Doe</span>
              <span className="text-sm text-gray-500">5 messages</span>
            </li>
            <li className="flex justify-between items-center text-gray-700">
              <span>Jane Smith</span>
              <span className="text-sm text-gray-500">3 messages</span>
            </li>
            <li className="flex justify-between items-center text-gray-700">
              <span>Alice Brown</span>
              <span className="text-sm text-gray-500">2 messages</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
