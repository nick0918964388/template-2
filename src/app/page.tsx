"use client";

import { useState, useEffect } from "react";
import VoiceRecorder from "@/components/VoiceRecorder";
import NotesList from "@/components/NotesList";
import { DeepgramContextProvider } from "@/lib/contexts/DeepgramContext";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import { getDocuments } from "@/lib/firebase/firebaseUtils";
import { motion, AnimatePresence } from 'framer-motion';
import { List } from 'lucide-react'; // 導入 List 圖標

export default function Home() {
  const [notes, setNotes] = useState<any[]>([]);
  const [visualizer, setVisualizer] = useState<number[]>([]);
  const [showTranscript, setShowTranscript] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [showAllNotes, setShowAllNotes] = useState(false);

  useEffect(() => {
    const fetchNotes = async () => {
      const fetchedNotes = await getDocuments("notes");
      setNotes(fetchedNotes);
    };
    fetchNotes();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisualizer(Array.from({ length: 20 }, () => Math.random() * 50 + 10));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleNewNote = async (transcript: string) => {
    setCurrentTranscript(transcript);
    setShowTranscript(true);
    setTimeout(() => {
      setShowTranscript(false);
      setShowAllNotes(true);
    }, 3000);
    await getDocuments("notes").then(setNotes);
  };

  return (
    <AuthProvider>
      <DeepgramContextProvider>
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-start p-8 relative overflow-hidden">
          {/* 背景圖案 */}
          <div className="absolute inset-0 opacity-10">
            {Array.from({ length: 100 }).map((_, i) => (
              <div key={i} className="absolute w-4 h-4 rounded-full bg-blue-500" style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)'
              }}></div>
            ))}
          </div>
          
          {!showAllNotes && (
            <>
              <h1 className="text-6xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
                臺鐵檢修助理
              </h1>
              <motion.button
                onClick={() => setShowAllNotes(true)}
                className="fixed top-8 right-8 flex items-center text-gray-400 hover:text-blue-400 transition-colors z-10"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <List className="mr-2" />
                對話歷史
              </motion.button>
            </>
          )}
          
          <AnimatePresence>
            {!showAllNotes && (
              <motion.div
                className="w-full max-w-4xl space-y-12 z-10"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <VoiceRecorder onNewNote={handleNewNote} />
                
                {/* 視覺化效果 */}
                <div className="h-24 flex items-end justify-center space-x-1">
                  {visualizer.map((height, index) => (
                    <motion.div
                      key={index}
                      className="w-4 bg-orange-500 rounded-t-full"
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ duration: 0.1 }}
                    ></motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {showTranscript && (
              <motion.div
                className="fixed inset-0 bg-gray-900 bg-opacity-90 flex items-center justify-center z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-2xl w-full"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <h2 className="text-2xl font-bold mb-4 text-orange-400">轉錄完成</h2>
                  <p className="text-lg text-gray-200">{currentTranscript}</p>
                </motion.div>
              </motion.div>
            )}

            {showAllNotes && (
              <motion.div
                className="w-full max-w-4xl z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <NotesList notes={notes} onBack={() => setShowAllNotes(false)} />
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* 浮動元素 */}
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-8 h-8 border border-blue-500 rounded-full opacity-20"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1, 0] }}
              transition={{
                duration: Math.random() * 10 + 5,
                repeat: Infinity,
                delay: Math.random() * 5
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            ></motion.div>
          ))}
        </div>
      </DeepgramContextProvider>
    </AuthProvider>
  );
}
