'use client';

import { useState, useEffect } from 'react';
import { Mic } from 'lucide-react';
import { useDeepgram } from '@/lib/contexts/DeepgramContext';
import { addDocument } from '@/lib/firebase/firebaseUtils';
import { motion } from 'framer-motion';

interface VoiceRecorderProps {
  onNewNote: (transcript: string) => void;
}

export default function VoiceRecorder({ onNewNote }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const { connectToDeepgram, disconnectFromDeepgram, connectionState, realtimeTranscript, error } = useDeepgram();

  const handleStartRecording = async () => {
    await connectToDeepgram();
    setIsRecording(true);
  };

  const handleStopRecording = async () => {
    disconnectFromDeepgram();
    setIsRecording(false);
    
    if (realtimeTranscript) {
      await addDocument("notes", {
        text: realtimeTranscript,
        timestamp: new Date().toISOString(),
      });
      onNewNote(realtimeTranscript);
    }
  };

  useEffect(() => {
    if (error) {
      alert(error);
      setIsRecording(false);
    }
  }, [error]);

  return (
    <div className="w-full flex flex-col items-center space-y-8">
      <motion.button
        onClick={isRecording ? handleStopRecording : handleStartRecording}
        className={`w-48 h-48 rounded-full transition-all duration-500 ease-in-out ${
          isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-orange-500 hover:bg-orange-600'
        } shadow-lg hover:shadow-xl flex items-center justify-center`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Mic className={`w-24 h-24 text-white transition-all duration-500 ${isRecording ? 'animate-pulse' : ''}`} />
      </motion.button>
      
      {isRecording && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-gray-800 rounded-lg shadow-xl border border-gray-700 w-full max-w-2xl"
        >
          <p className="text-lg text-gray-300">{realtimeTranscript || '正在聆聽...'}</p>
        </motion.div>
      )}
      
      <p className="text-center text-gray-400 text-xl">
        {isRecording ? '點擊麥克風停止錄音' : '點擊麥克風開始錄音'}
      </p>
    </div>
  );
}