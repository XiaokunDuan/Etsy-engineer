import React, { useState } from 'react';

interface TagListProps {
  tags: string[];
}

const TagList: React.FC<TagListProps> = ({ tags }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const copyTag = (tag: string, index: number) => {
    navigator.clipboard.writeText(tag);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const copyAllTags = () => {
    navigator.clipboard.writeText(tags.join(', '));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  if (!tags || tags.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-3">
        <label className="block text-sm font-semibold text-gray-800">
          Tags ({tags.length}/13)
        </label>
        <button 
          onClick={copyAllTags}
          className="text-xs text-etsy font-medium hover:underline"
        >
          {copiedAll ? "Copied all!" : "Copy all tags"}
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, idx) => (
          <button
            key={idx}
            onClick={() => copyTag(tag, idx)}
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors border ${
              copiedIndex === idx
                ? 'bg-green-100 text-green-800 border-green-200'
                : 'bg-white text-gray-700 border-gray-300 hover:border-orange-500 hover:text-orange-600'
            }`}
          >
            {tag}
            {copiedIndex === idx && (
              <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            )}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-gray-500">Click any tag to copy it individually.</p>
    </div>
  );
};

export default TagList;
