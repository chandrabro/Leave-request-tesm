
import React, { useState, useCallback } from 'react';
import { LeaveRequestForm } from './components/LeaveRequestForm';
import { Header } from './components/Header';
import { HistoryIcon } from './components/icons/HistoryIcon';
import { NewRequestIcon } from './components/icons/NewRequestIcon';
import { LeaveRequest, SubmissionStatus } from './types';
import { submitLeaveRequest } from './services/googleSheetsService';

type View = 'form' | 'history';

const App: React.FC = () => {
  const [view, setView] = useState<View>('form');
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<LeaveRequest[]>([]);

  const handleFormSubmit = useCallback(async (data: Omit<LeaveRequest, 'submissionDate'>) => {
    setSubmissionStatus('submitting');
    setError(null);
    
    const requestData: LeaveRequest = {
      ...data,
      submissionDate: new Date().toISOString(),
    };

    try {
      const success = await submitLeaveRequest(requestData);
      if (success) {
        setSubmissionStatus('success');
        setHistory(prevHistory => [requestData, ...prevHistory]);
        setTimeout(() => {
          setSubmissionStatus('idle');
          setView('history');
        }, 2000);
      } else {
        throw new Error('Submission failed. Please check your Google Apps Script setup.');
      }
    } catch (err) {
      setSubmissionStatus('error');
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    }
  }, []);

  const resetForm = useCallback(() => {
    setSubmissionStatus('idle');
    setError(null);
    setView('form');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased">
      <div className="container mx-auto max-w-lg h-screen flex flex-col shadow-2xl bg-white">
        <Header />
        <main className="flex-grow p-4 md:p-6 overflow-y-auto">
          {view === 'form' && (
            <LeaveRequestForm 
              onSubmit={handleFormSubmit} 
              status={submissionStatus} 
              error={error}
              onReset={resetForm}
            />
          )}
          {view === 'history' && (
            <SubmissionHistory history={history} />
          )}
        </main>
        <BottomNavBar view={view} setView={setView} />
      </div>
    </div>
  );
};

const SubmissionHistory: React.FC<{ history: LeaveRequest[] }> = ({ history }) => {
  if (history.length === 0) {
    return (
      <div className="text-center p-10">
        <HistoryIcon className="w-16 h-16 mx-auto text-gray-300" />
        <h2 className="mt-4 text-xl font-semibold text-gray-700">No Requests Yet</h2>
        <p className="mt-2 text-gray-500">Your submitted leave requests will appear here.</p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Submission History</h2>
      {history.map((req, index) => (
        <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-bold text-indigo-600">{req.leaveType}</p>
              <p className="text-sm text-gray-600">{req.employeeName} ({req.employeeId})</p>
            </div>
            <span className="text-xs bg-green-100 text-green-800 font-medium px-2 py-1 rounded-full">Submitted</span>
          </div>
          <div className="mt-3 text-sm text-gray-700">
            <p><span className="font-semibold">Dates:</span> {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}</p>
            <p className="mt-1"><span className="font-semibold">Reason:</span> {req.reason}</p>
            <p className="mt-2 text-xs text-gray-400">Submitted on: {new Date(req.submissionDate).toLocaleString()}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

const BottomNavBar: React.FC<{ view: View; setView: (view: View) => void }> = ({ view, setView }) => {
  const baseClasses = "flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200";
  const activeClasses = "text-indigo-600";
  const inactiveClasses = "text-gray-500 hover:text-indigo-500";

  return (
    <nav className="flex border-t bg-gray-50 sticky bottom-0">
      <button 
        onClick={() => setView('form')} 
        className={`${baseClasses} ${view === 'form' ? activeClasses : inactiveClasses}`}
      >
        <NewRequestIcon className="w-6 h-6" />
        <span className="text-xs font-medium">New Request</span>
      </button>
      <button 
        onClick={() => setView('history')} 
        className={`${baseClasses} ${view === 'history' ? activeClasses : inactiveClasses}`}
      >
        <HistoryIcon className="w-6 h-6" />
        <span className="text-xs font-medium">History</span>
      </button>
    </nav>
  );
};

export default App;
