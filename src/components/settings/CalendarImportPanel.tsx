import { useRef, useState } from 'react';
import { Panel } from '../shared/Panel';

export const CalendarImportPanel = () => {
  console.log('CalendarImportPanel rendering');
  
  return (
    <Panel title="CALENDAR">
      <div className="space-y-3">
        <button
          onClick={() => alert('Button clicked!')}
          className="btn btn-secondary w-full text-body"
        >
          TEST BUTTON
        </button>
      </div>
    </Panel>
  );
};
