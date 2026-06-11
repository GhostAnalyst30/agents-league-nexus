import React from 'react';
import { QuestData } from '../services/api';

interface Props {
  quests: QuestData[];
}

export default function QuestJournal({ quests }: Props) {
  if (quests.length === 0) return <div className="quest-journal"><p>No quests available.</p></div>;

  return (
    <div className="quest-journal">
      <h4>📜 Quest Journal</h4>
      {quests.map(q => {
        const total = q.original_objectives?.length || q.objectives.length;
        const done = total - q.objectives.length;
        const pct = total > 0 ? (done / total) * 100 : 0;
        const statusIcon = q.status === 'completed' ? '✅' : q.status === 'failed' ? '❌' : '🔄';

        return (
          <div key={q.id} className={`quest-card ${q.status}`}>
            <div className="quest-header">
              <span className="quest-icon">{statusIcon}</span>
              <strong>{q.name}</strong>
              <span className="quest-status">{q.status}</span>
            </div>
            <p className="quest-desc">{q.description}</p>
            <div className="quest-progress">
              <div className="quest-bar-bg">
                <div className="quest-bar-fill" style={{ width: `${pct}%` }} />
              </div>
              <span className="quest-progress-text">{done}/{total}</span>
            </div>
            {q.objectives.length > 0 && (
              <ul className="quest-objectives">
                {q.objectives.map((obj, i) => (
                  <li key={i} className="obj-pending">☐ {obj}</li>
                ))}
              </ul>
            )}
            {q.clues.filter(c => c.startsWith('Objective completed')).map((clue, i) => (
              <div key={i} className="quest-clue">✓ {clue}</div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
