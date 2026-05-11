import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import * as signalR from '@microsoft/signalr';

const SignalRContext = createContext(null);

// Thêm token vào props
export const SignalRProvider = ({ children, hubUrl, accessToken }) => { // <-- THÊM accessToken
  const [connection, setConnection] = useState(null);
  const listenersRef = useRef({});

  useEffect(() => {
    if (!hubUrl || !accessToken) { // Đảm bảo có hubUrl và accessToken
      console.warn("SignalRProvider: hubUrl or accessToken missing. Connection will not be established.");
      return;
    }

    const newConnection = new signalR.HubConnectionBuilder()
      // Truyền token qua query string
      .withUrl(`${hubUrl}?access_token=${accessToken}`, {
        // Cần truyền accessToken vào Headers nếu bạn cấu hình server nhận từ Header.
        // Tuy nhiên, với SignalR qua WebSocket, query string là cách phổ biến.
        // headers: { "Authorization": `Bearer ${accessToken}` }
      })
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);

    return () => {
      if (newConnection.state === signalR.HubConnectionState.Connected) {
        newConnection.stop();
      }
    };
  }, [hubUrl, accessToken]); // <-- THÊM accessToken vào dependency array

  useEffect(() => {
    if (connection) {
      connection.start()
        .then(() => {
          connection.on('ReceiveNotification', (message, data) => {
            if (listenersRef.current[message]) {
              listenersRef.current[message](data);
            } else {
              console.warn(`No listener registered for notification type: ${message}`);
            }
          });
        })
        .catch(e => console.error('SignalR Connection Failed from Context: ', e));
    }
  }, [connection]);

  const addNotificationListener = (notificationType, callback) => {
    listenersRef.current[notificationType] = callback;
  };

  const removeNotificationListener = (notificationType) => {
    delete listenersRef.current[notificationType];
  };

  return (
    <SignalRContext.Provider value={{ connection, addNotificationListener, removeNotificationListener }}>
      {children}
    </SignalRContext.Provider>
  );
};

export const useSignalRContext = () => useContext(SignalRContext);