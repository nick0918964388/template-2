"use client";

import {
  createClient,
  LiveTranscriptionEvents,
  type LiveTranscriptionEvent,
} from "@deepgram/sdk";

import { createContext, useContext, useState, ReactNode, FunctionComponent, useRef } from "react";

interface DeepgramContextType {
  connectToDeepgram: () => Promise<void>;
  disconnectFromDeepgram: () => void;
  connectionState: string;
  realtimeTranscript: string;
  error: string | null;
}

const DeepgramContext = createContext<DeepgramContextType | undefined>(undefined);

interface DeepgramContextProviderProps {
  children: ReactNode;
}

const getApiKey = async (): Promise<string> => {
  try {
    const response = await fetch("/api/deepgram", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    if (!result.key) {
      throw new Error("API key not found in response");
    }
    return result.key;
  } catch (error) {
    console.error("獲取 Deepgram API 密鑰時出錯:", error);
    throw error;
  }
};

const DeepgramContextProvider: FunctionComponent<DeepgramContextProviderProps> = ({ children }) => {
  const [connectionState, setConnectionState] = useState<string>("closed");
  const [realtimeTranscript, setRealtimeTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const connectionRef = useRef<any>(null);
  const audioRef = useRef<MediaRecorder | null>(null);

  const connectToDeepgram = async () => {
    try {
      setError(null);
      setRealtimeTranscript("");

      console.log("請求麥克風權限...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("麥克風權限已獲得");

      audioRef.current = new MediaRecorder(stream);

      console.log("獲取 Deepgram API 密鑰...");
      const apiKey = await getApiKey();
      console.log("Deepgram API 密鑰已獲得");

      console.log("創建 Deepgram 客戶端...");
      const deepgram = createClient(apiKey);

      console.log("建立即時轉錄連接...");
      const connection = deepgram.listen.live({
        model: "nova-2",
        language: "zh-TW",
        smart_format: true,
      });

      connection.on(LiveTranscriptionEvents.Open, () => {
        setConnectionState("open");
        console.log("Deepgram 連接已開啟");

        connection.on(LiveTranscriptionEvents.Close, () => {
          console.log("Deepgram 連接已關閉");
          setConnectionState("closed");
        });

        connection.on(LiveTranscriptionEvents.Transcript, (data) => {
          const newTranscript = data.channel.alternatives[0].transcript;
          setRealtimeTranscript((prev) => prev + " " + newTranscript);
        });

        connection.on(LiveTranscriptionEvents.Metadata, (data) => {
          console.log("Metadata:", data);
        });

        connection.on(LiveTranscriptionEvents.Error, (err) => {
          console.error("Deepgram 錯誤:", err);
          setError(`Deepgram 錯誤: ${err.message || "未知錯誤"}`);
          disconnectFromDeepgram();
        });

        audioRef.current!.addEventListener("dataavailable", (event) => {
          if (event.data.size > 0) {
            connection.send(event.data);
          }
        });

        audioRef.current!.start(250);
      });

      connectionRef.current = connection;
    } catch (error) {
      console.error("啟動語音識別時發生錯誤:", error);
      setError(error instanceof Error ? `錯誤: ${error.message}` : "發生未知錯誤");
      setConnectionState("closed");
    }
  };

  const disconnectFromDeepgram = () => {
    if (connectionRef.current) {
      connectionRef.current.finish();
      connectionRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.stop();
    }
    setRealtimeTranscript("");
    setConnectionState("closed");
  };

  return (
    <DeepgramContext.Provider
      value={{
        connectToDeepgram,
        disconnectFromDeepgram,
        connectionState,
        realtimeTranscript,
        error,
      }}
    >
      {children}
    </DeepgramContext.Provider>
  );
};

function useDeepgram(): DeepgramContextType {
  const context = useContext(DeepgramContext);
  if (context === undefined) {
    throw new Error("useDeepgram 必須在 DeepgramContextProvider 內使用");
  }
  return context;
}

export {
  DeepgramContextProvider,
  useDeepgram,
  LiveTranscriptionEvents,
  type LiveTranscriptionEvent,
};
