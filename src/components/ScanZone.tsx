import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Shield, Upload, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface ScanZoneProps {
  onScan: (data: any) => void;
  isScanning: boolean;
}

export const ScanZone: React.FC<ScanZoneProps> = ({ onScan, isScanning }) => {
  const [manualData, setManualData] = useState({
    vid: '',
    pid: '',
    serialNumber: '',
    description: '',
  });

  const onDrop = (acceptedFiles: File[]) => {
    // Simulate firmware analysis from file
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = () => {
      // Mock hash generation
      const mockHash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      onScan({ ...manualData, firmwareHash: mockHash, fileName: file.name });
    };
    reader.readAsArrayBuffer(file);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    disabled: isScanning,
    multiple: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onScan(manualData);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div className="bg-black/40 border border-cyan-500/30 rounded-2xl p-6 backdrop-blur-xl">
          <h3 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" /> Manual Device Entry
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-gray-400">Vendor ID (VID)</label>
                <input 
                  type="text" 
                  placeholder="e.g. 0781"
                  className="w-full bg-black/60 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-cyan-500 outline-none transition-colors"
                  value={manualData.vid}
                  onChange={e => setManualData({...manualData, vid: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-gray-400">Product ID (PID)</label>
                <input 
                  type="text" 
                  placeholder="e.g. 5581"
                  className="w-full bg-black/60 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-cyan-500 outline-none transition-colors"
                  value={manualData.pid}
                  onChange={e => setManualData({...manualData, pid: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-gray-400">Serial Number</label>
              <input 
                type="text" 
                placeholder="Optional"
                className="w-full bg-black/60 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-cyan-500 outline-none transition-colors"
                value={manualData.serialNumber}
                onChange={e => setManualData({...manualData, serialNumber: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-gray-400">Behavioral Description</label>
              <textarea 
                placeholder="Describe device behavior or intended use..."
                className="w-full bg-black/60 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-cyan-500 outline-none transition-colors h-24 resize-none"
                value={manualData.description}
                onChange={e => setManualData({...manualData, description: e.target.value})}
              />
            </div>
            <button 
              type="submit"
              disabled={isScanning}
              className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-700 text-white font-bold py-3 rounded-lg transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
            >
              {isScanning ? 'ANALYZING...' : 'INITIATE HARDWARE SCAN'}
            </button>
          </form>
        </div>
      </div>

      <div 
        {...getRootProps()} 
        className={cn(
          "border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-12 transition-all cursor-pointer",
          isDragActive ? "border-cyan-400 bg-cyan-400/10" : "border-gray-800 bg-black/20 hover:border-gray-700",
          isScanning && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />
        <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mb-6 border border-gray-800">
          <Upload className={cn("w-10 h-10", isDragActive ? "text-cyan-400" : "text-gray-500")} />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Firmware Analysis Zone</h3>
        <p className="text-gray-400 text-center max-w-xs">
          Drag & drop firmware binary or device log files (up to 10MB) for deep integrity verification.
        </p>
        <div className="mt-8 flex gap-4 text-xs font-mono">
          <span className="bg-gray-900 px-3 py-1 rounded border border-gray-800 text-gray-500">.BIN</span>
          <span className="bg-gray-900 px-3 py-1 rounded border border-gray-800 text-gray-500">.HEX</span>
          <span className="bg-gray-900 px-3 py-1 rounded border border-gray-800 text-gray-500">.LOG</span>
        </div>
      </div>
    </div>
  );
};
