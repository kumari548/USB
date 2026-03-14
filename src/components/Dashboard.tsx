import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { Shield, AlertTriangle, CheckCircle, Activity, Database, Cpu } from 'lucide-react';
import { USBScan } from '../types';
import { cn } from '../lib/utils';

interface DashboardProps {
  scans: USBScan[];
  currentScan?: USBScan;
}

export const Dashboard: React.FC<DashboardProps> = ({ scans, currentScan }) => {
  const radarData = currentScan ? [
    { subject: 'Manufacturer', A: currentScan.analysis.whitelist ? 100 : 20, fullMark: 100 },
    { subject: 'Integrity', A: currentScan.analysis.integrity ? 100 : 30, fullMark: 100 },
    { subject: 'Behavioral', A: currentScan.analysis.behavioral === 'Safe' ? 100 : 40, fullMark: 100 },
    { subject: 'AI Anomaly', A: (10 - currentScan.analysis.aiAnomaly) * 10, fullMark: 100 },
    { subject: 'Trust', A: currentScan.score, fullMark: 100 },
  ] : [];

  const historyData = scans.slice(-10).map(s => ({
    time: new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    score: s.score
  }));

  return (
    <div className="space-y-8">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-black/40 border border-gray-800 rounded-2xl p-6 backdrop-blur-xl flex items-center gap-4">
          <div className="w-12 h-12 bg-cyan-950 rounded-xl flex items-center justify-center text-cyan-400 border border-cyan-500/30">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-500">Total Scans</p>
            <p className="text-2xl font-bold text-white">{scans.length}</p>
          </div>
        </div>
        <div className="bg-black/40 border border-gray-800 rounded-2xl p-6 backdrop-blur-xl flex items-center gap-4">
          <div className="w-12 h-12 bg-red-950 rounded-xl flex items-center justify-center text-red-400 border border-red-500/30">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-500">Threats Detected</p>
            <p className="text-2xl font-bold text-white">{scans.filter(s => s.verdict === 'DANGEROUS').length}</p>
          </div>
        </div>
        <div className="bg-black/40 border border-gray-800 rounded-2xl p-6 backdrop-blur-xl flex items-center gap-4">
          <div className="w-12 h-12 bg-green-950 rounded-xl flex items-center justify-center text-green-400 border border-green-500/30">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-500">Avg Trust Score</p>
            <p className="text-2xl font-bold text-white">
              {scans.length ? Math.round(scans.reduce((acc, s) => acc + s.score, 0) / scans.length) : 0}%
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Analysis Radar */}
        <div className="lg:col-span-1 bg-black/40 border border-gray-800 rounded-2xl p-6 backdrop-blur-xl">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" /> Trust Vector Analysis
          </h3>
          <div className="h-64">
            {currentScan ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#333" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="Analysis"
                    dataKey="A"
                    stroke="#06b6d4"
                    fill="#06b6d4"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-600 text-sm italic">
                No active scan data
              </div>
            )}
          </div>
        </div>

        {/* Score History */}
        <div className="lg:col-span-2 bg-black/40 border border-gray-800 rounded-2xl p-6 backdrop-blur-xl">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-400" /> Trust Score History
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="time" stroke="#444" fontSize={10} />
                <YAxis stroke="#444" fontSize={10} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }}
                  itemStyle={{ color: '#06b6d4' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#06b6d4" 
                  strokeWidth={2} 
                  dot={{ fill: '#06b6d4', r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Scans Table */}
      <div className="bg-black/40 border border-gray-800 rounded-2xl overflow-hidden backdrop-blur-xl">
        <div className="p-6 border-b border-gray-800">
          <h3 className="text-lg font-bold text-white">Recent Security Audits</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-900/50 text-xs uppercase tracking-widest text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium">Device (VID:PID)</th>
                <th className="px-6 py-4 font-medium">Timestamp</th>
                <th className="px-6 py-4 font-medium">Verdict</th>
                <th className="px-6 py-4 font-medium">Trust Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {scans.slice().reverse().map((scan, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm text-gray-300">
                    {scan.vid}:{scan.pid}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {new Date(scan.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                      scan.verdict === 'SAFE' ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                      scan.verdict === 'SUSPICIOUS' ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" :
                      "bg-red-500/10 text-red-400 border border-red-500/20"
                    )}>
                      {scan.verdict}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full transition-all",
                            scan.score > 80 ? "bg-green-500" : scan.score > 50 ? "bg-yellow-500" : "bg-red-500"
                          )}
                          style={{ width: `${scan.score}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-white">{scan.score}%</span>
                    </div>
                  </td>
                </tr>
              ))}
              {scans.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-600 italic">
                    No scan history found. Initiate your first hardware audit above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
