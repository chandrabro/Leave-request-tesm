
import React, { useState, useMemo } from 'react';
import { LeaveRequest, LeaveType, SubmissionStatus } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { ExclamationCircleIcon } from './icons/ExclamationCircleIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface LeaveRequestFormProps {
  onSubmit: (data: Omit<LeaveRequest, 'submissionDate'>) => void;
  status: SubmissionStatus;
  error: string | null;
  onReset: () => void;
}

export const LeaveRequestForm: React.FC<LeaveRequestFormProps> = ({ onSubmit, status, error, onReset }) => {
  const [employeeName, setEmployeeName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [leaveType, setLeaveType] = useState<LeaveType>(LeaveType.CASUAL);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [formError, setFormError] = useState('');
  
  const minEndDate = useMemo(() => {
    if (!startDate) return '';
    return startDate;
  }, [startDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeName || !employeeId || !startDate || !endDate || !reason) {
      setFormError('All fields are required.');
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setFormError('End date cannot be before start date.');
      return;
    }
    setFormError('');
    onSubmit({ employeeName, employeeId, leaveType, startDate, endDate, reason });
  };
  
  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <CheckCircleIcon className="w-20 h-20 text-green-500" />
        <h2 className="mt-4 text-2xl font-bold text-gray-800">Request Submitted!</h2>
        <p className="mt-2 text-gray-600">Your leave request has been sent for approval.</p>
      </div>
    );
  }

  if (status === 'error') {
     return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <ExclamationCircleIcon className="w-20 h-20 text-red-500" />
        <h2 className="mt-4 text-2xl font-bold text-gray-800">Submission Failed</h2>
        <p className="mt-2 text-gray-600 bg-red-50 p-3 rounded-md">{error}</p>
        <button
            onClick={onReset}
            className="mt-6 w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
            Try Again
        </button>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="employeeName" className="block text-sm font-medium text-gray-700">Employee Name</label>
        <input type="text" id="employeeName" value={employeeName} onChange={e => setEmployeeName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="John Doe" />
      </div>
      <div>
        <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700">Employee ID</label>
        <input type="text" id="employeeId" value={employeeId} onChange={e => setEmployeeId(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="EMP12345" />
      </div>
      <div>
        <label htmlFor="leaveType" className="block text-sm font-medium text-gray-700">Leave Type</label>
        <select id="leaveType" value={leaveType} onChange={e => setLeaveType(e.target.value as LeaveType)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
          {Object.values(LeaveType).map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
          <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" min={new Date().toISOString().split('T')[0]}/>
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
          <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" min={minEndDate} disabled={!startDate} />
        </div>
      </div>
      <div>
        <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Reason for Leave</label>
        <textarea id="reason" value={reason} onChange={e => setReason(e.target.value)} rows={4} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="e.g., Family vacation"></textarea>
      </div>
      {formError && <p className="text-sm text-red-600">{formError}</p>}
      <div>
        <button type="submit" disabled={status === 'submitting'} className="w-full flex justify-center items-center bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:bg-indigo-300">
          {status === 'submitting' ? (
            <>
              <SpinnerIcon className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
              Submitting...
            </>
          ) : (
            'Submit Request'
          )}
        </button>
      </div>
    </form>
  );
};
