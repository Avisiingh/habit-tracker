'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export function DailyPlanForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [subjects, setSubjects] = useState<string[]>(['']);
  const [accomplishments, setAccomplishments] = useState<string[]>(['']);

  const handleAddSubject = () => {
    setSubjects([...subjects, '']);
  };

  const handleAddAccomplishment = () => {
    setAccomplishments([...accomplishments, '']);
  };

  const handleSubjectChange = (index: number, value: string) => {
    const newSubjects = [...subjects];
    newSubjects[index] = value;
    setSubjects(newSubjects);
  };

  const handleAccomplishmentChange = (index: number, value: string) => {
    const newAccomplishments = [...accomplishments];
    newAccomplishments[index] = value;
    setAccomplishments(newAccomplishments);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      subjects: subjects.filter(Boolean),
      accomplishments: accomplishments.filter(Boolean),
      date: new Date().toISOString(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Today's Subjects</h3>
        <div className="space-y-3">
          {subjects.map((subject, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={subject}
                onChange={(e) => handleSubjectChange(index, e.target.value)}
                placeholder="Enter subject name"
                className="flex-1 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
              {index === subjects.length - 1 && (
                <button
                  type="button"
                  onClick={handleAddSubject}
                  className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  +
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Today's Accomplishments</h3>
        <div className="space-y-3">
          {accomplishments.map((accomplishment, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={accomplishment}
                onChange={(e) => handleAccomplishmentChange(index, e.target.value)}
                placeholder="Enter your accomplishment"
                className="flex-1 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
              {index === accomplishments.length - 1 && (
                <button
                  type="button"
                  onClick={handleAddAccomplishment}
                  className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  +
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      >
        Save Daily Progress
      </motion.button>
    </form>
  );
} 