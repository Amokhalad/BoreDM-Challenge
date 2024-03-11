// src/hooks/useDataGridWebSocket.ts
import { useState, useCallback, useEffect } from 'react';
import useWebSocket, { ReadyState} from 'react-use-websocket';

import {GridRowId }from '@mui/x-data-grid';

export const useDataGridWebSocket = (wsUrl: string) => {
    const [rows, setRows] = useState<any[]>([]);
    // Custom hook for managing WebSocket messages
    const {
      sendMessage,
      lastMessage,
      readyState,
  } = useWebSocket(wsUrl, {
      shouldReconnect: (closeEvent) => true, // Automatically reconnect
      onOpen: () => console.log("WebSocket Connected"),
      onClose: () => console.log("WebSocket Disconnected"),
  });

    // Handle incoming WebSocket messages for both initial load and read
    useEffect(() => {
      if (lastMessage !== null) {
          const message = JSON.parse(lastMessage.data);
          switch (message.type) {
              case 'initial':
              case 'read': // Server sends read data after any CUD operation
                  setRows(message.data); // Update rows state with the new data
                  break;
              default:
                  break;
          }
      }
    }, [lastMessage]);

    const createRow = useCallback((newRowData: any) => {
        sendMessage(JSON.stringify({ type: 'create', data: newRowData }));
    }, [sendMessage]);

    const updateRow = useCallback((updatedRowData: any) => {
        console.log("updating...");
        
        sendMessage(JSON.stringify({ type: 'update', data: updatedRowData }));
    }, [sendMessage]);

    const deleteRow = useCallback((id: GridRowId) => {
        sendMessage(JSON.stringify({ type: 'delete', id }));
    }, [sendMessage]);

    const readData = useCallback(() => {
      sendMessage(JSON.stringify({ type: 'read' }));
  }, [sendMessage]);


    return {
        rows,
        setRows,
        createRow,
        updateRow,
        deleteRow,
        readData,
    };
};
