import React, { useState } from 'react';
import { CopyFieldProps } from '../types';

const CopyField: React.FC<CopyFieldProps> = ({ label, value, multiline = false, helperText }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mb-5 group">
      <div className="flex justify-between items-baseline mb-1">
        <label className="block text-sm font-semibold text-gray-800">
          {label}
        </label>
        {helperText && <span className="text-xs text-gray-500">{helperText}</span>}
      </div>
      
      <div className="relative">
        {multiline ? (
          <textarea
            readOnly
            value={value}
            rows={6}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm bg-white p-3 border resize-none text-gray-700"
          />
        ) : (
          <input
            type="text"
            readOnly
            value={value}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm bg-white p-3 border text-gray-700 h-11"
          />
        )}
        
        <button
          onClick={handleCopy}
          className={`absolute top-2 right-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ${
            copied
              ? 'bg-green-100 text-green-800 ring-green-500'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 ring-orange-500'
          }`}
        >
          {copied ? (
            <>
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Copied
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
              Copy
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CopyField;
