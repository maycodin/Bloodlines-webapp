// components/BloodInventoryDashboard.tsx
'use client';

import { useState } from 'react';
import { Calendar, HeartPulse, Plus, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from 'recharts';
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from 'react-datepicker';
import CriticalBloodRequestCard, { BloodRequestType } from '@/components/CriticalBloodRequestCard';
import DonorResponsePieChart from '@/components/DonorResponsePieCart';

interface BloodInventoryDashboardProps {
  bloodRequests: BloodRequestType[];
  handleConfirm: (id: string | number) => void;
  handleEdit: (id: string | number) => void;
  setActivePage?: (page: string) => void; 
}

export default function BloodInventoryDashboard({ 
  bloodRequests, 
  handleConfirm, 
  handleEdit,
  setActivePage 
}: BloodInventoryDashboardProps) {
  // Data for blood type fulfillment - Horizontal Bar Chart
  const bloodTypeData = [
    { name: 'O+', value: 65, color: '#dc2626' },
    { name: 'A+', value: 45, color: '#ef4444' },
    { name: 'B-', value: 30, color: '#3b82f6' },
    { name: 'AB-', value: 15, color: '#8b5cf6' },
  ];

  // Data for urgency level - Horizontal Bar Chart
  const urgencyData = [
    { name: 'Critical', value: 65, color: '#dc2626' },
    { name: 'Urgent', value: 45, color: '#f97316' },
    { name: 'Scheduled', value: 30, color: '#22c55e' },
  ];

  // Data for monthly requests - Line Chart
  const monthlyData = [
    { month: 'Jun', requests: 42 },
    { month: 'Jul', requests: 38 },
    { month: 'Aug', requests: 55 },
    { month: 'Sep', requests: 25 },
  ];

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm">
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">{payload[0].value}%</span> fulfillment
          </p>
        </div>
      );
    }
    return null;
  };

  // Line chart tooltip
  const LineTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm">
          <p className="font-medium text-gray-900">Month: {label}</p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">{payload[0].value}</span> requests
          </p>
        </div>
      );
    }
    return null;
  };
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date(2025, 8, 1)); // Sep 1, 2025
  return (
    <div className="w-full space-y-6">
     {/* Top Cards */}
     <div className='flex flex-row gap-3'>
        <div className='space-y-4 w-1/4'>
        {/* Total Requests Card */}
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-6">
            <div className="flex items-center justify-between">
            <div>
                <h3 className="text-xs font-bold text-black mb-3">Total Requests</h3>
                <div className="flex items-baseline">
                <span className="text-2xl font-bold text-black">25</span>
                </div>
            </div>
            {/* Date Selector */}
                <div className="relative ">
                <DatePicker
                    selected={selectedDate} // Sep 1, 2025
                    onChange={(date: Date | null) => setSelectedDate(date)} // Handle date change
                    dateFormat="MMM, d, yyyy"
                    className="w-35 bg-white text-xs p-2 rounded-lg font-extralight border border-gray-200 text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    wrapperClassName="w-full"
                    placeholderText="Select date"
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                />
                <Calendar className="absolute right-1.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
            </div>  
        </div>
        {/* Blood Inventory Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs font-bold text-black">Blood Inventory</h2>
            {/* Date Selector */}
                <div className="relative ">
                <DatePicker
                    selected={selectedDate} // Sep 1, 2025
                    onChange={(date: Date | null) => setSelectedDate(date)} // Handle date change
                    dateFormat="MMM, d, yyyy"
                    className="w-35 bg-white text-xs p-2 rounded-lg font-extralight border border-gray-200 text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    wrapperClassName="w-full"
                    placeholderText="Select date"
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                />
                <Calendar className="absolute right-1.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
                { type: 'A+', units: 3, color: 'border-red-500', bg: 'bg-red-50' },
                { type: 'A-', units: 8, color: 'border-red-400', bg: 'bg-red-50' },
                { type: 'B+', units: 9, color: 'border-blue-500', bg: 'bg-blue-50' },
                { type: 'B-', units: 7, color: 'border-blue-400', bg: 'bg-blue-50' },
                { type: 'AB+', units: 8, color: 'border-purple-500', bg: 'bg-purple-50' },
                { type: 'AB-', units: 9, color: 'border-purple-400', bg: 'bg-purple-50' },
                { type: 'O+', units: 7, color: 'border-green-500', bg: 'bg-green-50' },
                { type: 'O-', units: 5, color: 'border-green-400', bg: 'bg-green-50' },
            ].map((bloodType) => (
                <div key={bloodType.type} className='flex flex-col items-center'>
                <div 
                className={`${bloodType.bg} rounded-lg p-3 ${bloodType.color}`}
                >
                <div className="text-sm font-medium text-black">{bloodType.type}</div>
                
                </div>
                <div className="text-xs font-light text-black mt-1">{bloodType.units} unit(s)</div>
                <div className="text-xs font-extralight text-black mt-1">Available</div>
                </div>
            ))}
            </div>  
        </div>
        </div>
        <div className="w-3/4">
        {/* Request Fulfillment Card */}
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-6">
            <h3 className="text-lg font-bold text-black mb-3">Request Fulfillment</h3>
            <hr className='my-3 text-[#e5e7eb]' />
            
            {/* Three Charts Grid */}
            <div className="flex gap-2">
            
            {/* By Blood Type - Horizontal Bar Chart */}
            <div className="flex-1">
                <div className="flex items-center justify-between mb-6">
                <h4 className="text-sm font-semibold text-gray-900">By Blood Type</h4>
                </div>        
                <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                    layout="vertical"
                    data={bloodTypeData}
                    margin={{ top: 5, right: 5, left: 50, bottom: 5 }}
                    >
                    <CartesianGrid 
                        strokeDasharray="3 3" 
                        stroke="#ECEFF1" 
                        horizontal={false} 
                        vertical={false}
                    />
                    <XAxis 
                        type="number" 
                        domain={[0, 100]}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6b7280', fontSize: 10 }}
                        tickFormatter={(value) => `${value}%`}
                    />
                    <YAxis 
                        type="category" 
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        width={40}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                        dataKey="value" 
                        radius={[0, 4, 4, 0]}
                        barSize={16}
                        background={{ fill: '#ECEFF1' }}
                    >
                        {bloodTypeData.map((entry, index) => {
                        // Assign colors based on blood type
                        let barColor = '#78A787'; // default for A+ and B-
                        if (entry.name === 'O+') barColor = '#1C7C3A';
                        if (entry.name === 'AB-') barColor = '#EF9A9A';
                        
                        return (
                            <Cell 
                            key={`cell-${index}`} 
                            fill={barColor}
                            />
                        );
                        })}
                    </Bar>
                    </BarChart>
                </ResponsiveContainer>
                </div>
            </div>
            
            {/* By Urgency Level - Horizontal Bar Chart */}
            <div className="flex-1 border-l border-[#e5e7eb] pl-4">
                <div className="flex items-center justify-between mb-6">
                <h4 className="text-sm font-semibold text-gray-900">By Urgency Level</h4>
                </div>
                
                <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                    layout="vertical"
                    data={urgencyData}
                    margin={{ top: 5, right: 5, left: 60, bottom: 5 }}
                    >
                    <CartesianGrid 
                        strokeDasharray="3 3" 
                        stroke="#ECEFF1" 
                        horizontal={false} 
                        vertical={false}
                    />
                    <XAxis 
                        type="number" 
                        domain={[0, 100]}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6b7280', fontSize: 10 }}
                        tickFormatter={(value) => `${value}%`}
                    />
                    <YAxis 
                        type="category" 
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        width={50}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                        dataKey="value" 
                        radius={[0, 4, 4, 0]}
                        barSize={16}
                        background={{ fill: '#ECEFF1' }}
                    >
                        {urgencyData.map((entry, index) => {
                        // Assign colors based on urgency
                        let barColor = '#1C7C3A'; // default for Scheduled
                        if (entry.name === 'Critical') barColor = '#EF9A9A';
                        if (entry.name === 'Urgent') barColor = '#EBBE54';
                        
                        return (
                            <Cell 
                            key={`cell-${index}`} 
                            fill={barColor}
                            />
                        );
                        })}
                    </Bar>
                    </BarChart>
                </ResponsiveContainer>
                </div>
            </div>
            
            {/* By Time - Line Chart */}
            <div className="flex-1 border-l border-[#e5e7eb] pl-4">
                <div className="flex items-center justify-between mb-6">
                <h4 className="text-sm font-semibold text-gray-900">By Time</h4>
                </div>
                
                <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                    data={monthlyData}
                    margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                    >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis 
                        dataKey="month" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6b7280', fontSize: 10 }}
                    />
                    <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6b7280', fontSize: 10 }}
                    />
                    <Tooltip content={<LineTooltip />} />
                    <Line
                        type="monotone"
                        dataKey="requests"
                        stroke="#1C7C3A"  
                        strokeWidth={2}
                        dot={{ 
                        r: 4, 
                        fill: '#1C7C3A', 
                        strokeWidth: 2,
                        stroke: '#ffffff'
                        }}
                        activeDot={{ 
                        r: 6, 
                        fill: '#1C7C3A', 
                        strokeWidth: 2,
                        stroke: '#ffffff'
                        }}
                    />
                    </LineChart>
                </ResponsiveContainer>
                </div>
                
                {/* Month labels below line chart */}
                <div className="mt-4 flex justify-between text-xs text-gray-500">
                {monthlyData.map((month) => (
                    <div key={month.month} className="text-center">
                    <div className={`font-medium ${month.month === 'Sep' ? 'text-red-600' : 'text-gray-700'}`}>
                        {month.month}
                    </div>
                    </div>
                ))}
                </div>
            </div>
            </div>
        </div>
        </div>
     </div>
    

    {/* Middle Grid */}
    <div className="flex gap-4 items-start">
        {/* Avg Response Time */}
        <div className="bg-white rounded-lg h-60 p-3 w-1/4  border border-[#D8D6D6]">
            <div className="flex justify-between">
            <div>
                <p className="text-black text-sm font-medium">Avg Response Time</p>
                <p className="text-2xl font-normal text-black mt-2">5m 10s</p>
            </div>
            <div className="relative">
                <select className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent cursor-pointer">
                <option>Month</option>
                <option>January</option>
                <option>February</option>
                <option>March</option>
                <option>April</option>
                <option>May</option>
                <option>June</option>
                <option>July</option>
                <option>August</option>
                <option>September</option>
                <option>October</option>
                <option>November</option>
                <option>December</option>
                </select>
                <div className="pointer-events-none absolute top-3 right-0 flex items-center px-2 text-gray-500">
                <Calendar className="w-4 h-4" />
                </div>
            </div>
            </div>
        </div>
        <DonorResponsePieChart />
        <div className="bg-white rounded-lg h-60 p-3 w-1/4 border border-[#D8D6D6]">
            <div className="flex items-start gap-5 justify-between">
            <div>
                <p className="text-black text-sm font-medium">Top Bridgers</p>
            </div>
            <div className="relative">
                <select className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-xs font-medium py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent cursor-pointer">
                <option>Month</option>
                <option>January</option>
                <option>February</option>
                <option>March</option>
                <option>April</option>
                <option>May</option>
                <option>June</option>
                <option>July</option>
                <option>August</option>
                <option>September</option>
                <option>October</option>
                <option>November</option>
                <option>December</option>
                </select>
                <div className="pointer-events-none absolute top-2 right-0 flex items-center px-2 text-gray-500">
                <Calendar className="w-4 h-4" />
                </div>
            </div>
            </div>
            <div className="mt-4 flex justify-between items-start space-y-2 border-b-[#D8D6D6] border-b">
                <span className="text-sm font-light text-black">Idi Araba</span>
                <span className="text-sm font-light text-black">8</span>
            </div>
            <div className="mt-4 flex justify-between items-start space-y-2 border-b-[#D8D6D6] border-b">
                <span className="text-sm font-light text-black">Surulere</span>
                <span className="text-sm font-light text-black">12</span>
            </div>
            <div className="mt-4 flex justify-between items-start space-y-2 border-b-[#D8D6D6] border-b">
                <span className="text-sm font-light text-black">Mushin</span>
                <span className="text-sm font-light text-black">20</span>
            </div>

        </div>
    </div>

     {/* Existing Requests Section */}
    <div className="bg-white rounded-xl p-6 border border-[#C91E1E] w-full mx-auto">
        <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">All Blood Requests</h2>
        </div>
        
        {bloodRequests.length > 0 ? (
        <div className="space-y-4">
            {bloodRequests.map((request) => (
            <CriticalBloodRequestCard
                key={request.id}
                request={request}
                onConfirm={handleConfirm}
                onEdit={handleEdit}
            />
            ))}
        </div>
        ) : (
        <div className="text-center py-12">
            <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No blood requests yet</h3>
            <p className="text-gray-600">Post your first blood request using the form above.</p>
            </div>
        </div>
        )}
    </div>

     
      
    </div>
  );
}