import React, { useState, useRef, useEffect } from 'react';
import { generateListingInfo } from './services/geminiService';
import { EtsyListingData } from './types';
import CopyField from './components/CopyField';

const App: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listingData, setListingData] = useState<EtsyListingData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Cast to File[] to ensure TS knows these are Files
      const selectedFiles = Array.from(e.target.files) as File[];
      setFiles(selectedFiles);
      
      const newUrls = selectedFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls(newUrls);
      
      setError(null);
      setListingData(null); // Reset previous data
    }
  };

  const handleGenerate = async () => {
    if (files.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const data = await generateListingInfo(files);
      setListingData(data);
    } catch (err: any) {
      setError(err.message || "Failed to generate listing. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Cast to File[] to ensure TS knows these are Files
      const droppedFiles = Array.from(e.dataTransfer.files) as File[];
      // Filter for images
      const imageFiles = droppedFiles.filter(file => file.type.startsWith('image/'));
      
      if (imageFiles.length > 0) {
        setFiles(imageFiles);
        const newUrls = imageFiles.map(file => URL.createObjectURL(file));
        setPreviewUrls(newUrls);
        setError(null);
        setListingData(null);
      }
    }
  };

  const resetState = () => {
    setFiles([]);
    setPreviewUrls([]);
    setListingData(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-etsy rounded flex items-center justify-center text-white font-bold text-lg">E</div>
            <h1 className="text-xl font-bold text-gray-900">Listing Generator <span className="text-gray-400 font-normal text-sm ml-2">Powered by Gemini</span></h1>
          </div>
          {listingData && (
             <button 
               onClick={resetState}
               className="text-sm text-gray-600 hover:text-gray-900 font-medium"
             >
               Start New Listing
             </button>
          )}
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
          
          {/* Left Column: Input & Preview */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">1. Upload Photos</h2>
              
              <div 
                className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${previewUrls.length > 0 ? 'border-gray-300' : 'border-gray-300 hover:border-orange-400 bg-gray-50 hover:bg-orange-50'}`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                 <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  multiple
                  className="hidden" 
                />

                {previewUrls.length > 0 ? (
                  <div className="space-y-4">
                    <div className={`grid gap-2 ${previewUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                      {previewUrls.map((url, idx) => (
                        <div key={idx} className="relative aspect-square">
                          <img 
                            src={url} 
                            alt={`Preview ${idx + 1}`} 
                            className="w-full h-full object-cover rounded shadow-sm border border-gray-100" 
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 font-medium">{files.length} image{files.length !== 1 ? 's' : ''} selected. Click to change.</p>
                  </div>
                ) : (
                  <div className="space-y-2 py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600 justify-center">
                      <span className="text-etsy font-medium">Upload photos</span>
                    </div>
                    <p className="text-xs text-gray-500">Drag & drop or click to select multiple</p>
                  </div>
                )}
              </div>

              {/* Generate Button */}
              <div className="mt-6">
                <button
                  onClick={handleGenerate}
                  disabled={files.length === 0 || loading}
                  className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-all ${
                    files.length === 0 || loading 
                      ? 'bg-gray-300 cursor-not-allowed' 
                      : 'bg-etsy hover:bg-etsy-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500'
                  }`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing {files.length} Image{files.length !== 1 ? 's' : ''}...
                    </>
                  ) : (
                    'Generate Listing Info'
                  )}
                </button>
              </div>

              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-8">
            {!listingData && !loading && (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 p-12">
                <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <p className="text-lg font-medium">Ready to generate content</p>
                <p className="text-sm">Upload images and click Generate to see the magic.</p>
              </div>
            )}

            {/* Skeleton Loading State */}
            {loading && (
              <div className="space-y-6 animate-pulse">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="space-y-3">
                      <div className="h-10 bg-gray-100 rounded w-full"></div>
                      <div className="h-10 bg-gray-100 rounded w-full"></div>
                      <div className="h-24 bg-gray-100 rounded w-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Actual Results */}
            {listingData && (
              <div className="space-y-8">
                
                {/* Section: Description */}
                <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                    <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider">About This Item</h3>
                  </div>
                  <div className="p-6">
                    <CopyField 
                      label="Description" 
                      value={listingData.description} 
                      multiline={true}
                      helperText="First few lines are crucial for SEO."
                    />
                  </div>
                </section>

                {/* Section: Attributes */}
                <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                   <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                    <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider">Attributes</h3>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6">
                    <CopyField label="Primary Color" value={listingData.primaryColor} />
                    <CopyField label="Secondary Color" value={listingData.secondaryColor} />
                    <CopyField label="Primary Fabric" value={listingData.primaryFabric} />
                    <CopyField label="Occasion" value={listingData.occasion} />
                    <CopyField label="Holiday" value={listingData.holiday} />
                  </div>
                </section>

                {/* Section: Materials */}
                <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                    <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider">Materials</h3>
                  </div>
                  <div className="p-6">
                       <CopyField 
                        label="Materials" 
                        value={listingData.materials.join(', ')} 
                        helperText="Separate ingredients with commas."
                      />
                  </div>
                </section>

              </div>
            )}
          </div>
        </div>
      </main>
      
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
           <p className="text-center text-sm text-gray-400">
             Generative AI can make mistakes. Please review all listing information before publishing on Etsy.
           </p>
        </div>
      </footer>
    </div>
  );
};

export default App;