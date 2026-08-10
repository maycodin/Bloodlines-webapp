// hooks/useSocket.ts
"use client";

import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { initializeSocket, disconnectSocket, getSocket, socketEvents } from '@/lib/api';

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [emergencyAlerts, setEmergencyAlerts] = useState<any[]>([]);
  const [inventoryAlerts, setInventoryAlerts] = useState<any[]>([]);
  const [appointmentReminders, setAppointmentReminders] = useState<any[]>([]);
  const [requestStatusUpdates, setRequestStatusUpdates] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) return;

    const socketInstance = initializeSocket(token);
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    // Emergency Alert Listener
    socketInstance.on(socketEvents.emergencyAlert, (data) => {
      console.log('🚨 Emergency Alert:', data);
      setEmergencyAlerts((prev) => [data, ...prev]);
      // Show browser notification
      if (Notification.permission === 'granted') {
        new Notification('🚨 Emergency Blood Alert!', {
          body: `${data.bloodType} needed urgently at ${data.hospitalName}`,
          icon: '/blood-drop.png',
        });
      }
    });

    // Inventory Alert Listener
    socketInstance.on(socketEvents.inventoryAlert, (data) => {
      console.log('📦 Inventory Alert:', data);
      setInventoryAlerts((prev) => [data, ...prev]);
    });

    // Appointment Reminder Listener
    socketInstance.on(socketEvents.appointmentReminder, (data) => {
      console.log('📅 Appointment Reminder:', data);
      setAppointmentReminders((prev) => [data, ...prev]);
    });

    // Request Status Update Listener
    socketInstance.on(socketEvents.requestStatusUpdate, (data) => {
      console.log('🔄 Request Status Update:', data);
      setRequestStatusUpdates((prev) => [data, ...prev]);
    });

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      disconnectSocket();
    };
  }, []);

  return {
    socket,
    isConnected,
    emergencyAlerts,
    inventoryAlerts,
    appointmentReminders,
    requestStatusUpdates,
  };
}