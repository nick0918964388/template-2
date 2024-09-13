import { format } from "date-fns";
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

interface Note {
  id: string;
  text: string;
  timestamp: string;
}

interface NotesListProps {
  notes: Note[];
}

export default function NotesList({ notes }: NotesListProps) {
  return (
    <div className="w-full max-w-2xl relative pt-16"> {/* 增加 pt-16 來為返回按鈕留出空間 */}
      <motion.button
        onClick={() => window.location.reload()}
        className="fixed top-8 left-8 flex items-center text-gray-400 hover:text-orange-400 transition-colors z-10"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <ArrowLeft className="mr-2" />
        返回
      </motion.button>

      {notes.length === 0 ? (
        <p className="text-gray-400 text-xl text-center">還沒有筆記。開始錄音來創建您的第一個筆記！</p>
      ) : (
        <ul className="space-y-4">
          {notes.map((note, index) => (
            <motion.li 
              key={note.id} 
              className="bg-gray-800 shadow-lg rounded-lg p-6 border border-gray-700"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <p className="text-xl text-gray-200 mb-2">{note.text}</p>
              <p className="text-sm text-gray-400">
                {format(new Date(note.timestamp), "yyyy年MM月dd日 HH:mm:ss")}
              </p>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}