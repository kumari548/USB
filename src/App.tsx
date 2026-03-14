import React, { useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  User
} from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { USBScan } from './types';
import { calculateTrustScore } from './services/trustEngine';
import { USBVisualizer } from './components/USBVisualizer';
import { ScanZone } from './components/ScanZone';
import { Dashboard } from './components/Dashboard';
import { ChatBot } from './components/ChatBot';
import { Shield, Lock, LogOut, User as UserIcon, Terminal, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { cn } from './lib/utils';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [scans, setScans] = useState<USBScan[]>([]);
  const [currentScan, setCurrentScan] = useState<USBScan | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) {
      setScans([]);
      return;
    }

    const q = query(
      collection(db, 'scans'), 
      where('uid', '==', user.uid),
      orderBy('timestamp', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const scanData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as USBScan[];
      setScans(scanData);
    });

    return unsubscribe;
  }, [user]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  const handleLogout = () => signOut(auth);

  const handleScan = async (data: any) => {
    if (!user) return;
    setIsScanning(true);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    const result = calculateTrustScore(data);
    const newScan: USBScan = {
      uid: user.uid,
      vid: data.vid,
      pid: data.pid,
      serialNumber: data.serialNumber || '',
      description: data.description || '',
      firmwareHash: data.firmwareHash || '',
      timestamp: new Date().toISOString(),
      score: result.score,
      verdict: result.verdict,
      analysis: result.analysis,
      technicalReasoning: result.reasoning
    };

    try {
      await addDoc(collection(db, 'scans'), newScan);
      setCurrentScan(newScan);
      if (result.verdict === 'SAFE') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#06b6d4', '#10b981']
        });
      }
    } catch (error) {
      console.error("Save Scan Error:", error);
    } finally {
      setIsScanning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
          <p className="text-cyan-500 font-mono text-sm animate-pulse">INITIALIZING TRUSTGUARD CORE...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1),transparent_50%)]" />
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 blur-[120px] rounded-full" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center z-10"
        >
          <div className="mb-8 flex justify-center">
            <div className="w-20 h-20 bg-cyan-950 rounded-3xl flex items-center justify-center border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
              <Shield className="w-10 h-10 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-4xl font-black tracking-tighter mb-4 uppercase italic">
            USB <span className="text-cyan-500">TrustGuard</span> AI
          </h1>
          <p className="text-gray-400 mb-12 leading-relaxed">
            Next-generation hardware security verification. Protect your perimeter from BadUSB, HID injection, and firmware-level threats.
          </p>
          
          <button 
            onClick={handleLogin}
            className="w-full group relative bg-white text-black font-bold py-4 rounded-xl overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="absolute inset-0 bg-cyan-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <span className="relative z-10 flex items-center justify-center gap-3 group-hover:text-white transition-colors">
              <Lock className="w-5 h-5" /> ACCESS SECURE TERMINAL
            </span>
          </button>
          
          <div className="mt-8 flex items-center justify-center gap-6 text-gray-600 text-[10px] uppercase tracking-[0.2em]">
            <span className="flex items-center gap-1"><Terminal className="w-3 h-3" /> AES-256</span>
            <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> AI-POWERED</span>
            <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> HARDWARE-LEVEL</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-cyan-500/30">
      {/* Navigation */}
      <nav className="border-b border-gray-800 bg-black/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-cyan-500" />
            <span className="font-black tracking-tighter text-xl uppercase italic">TrustGuard <span className="text-cyan-500">AI</span></span>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-900/50 rounded-full border border-gray-800">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">System Status: Optimal</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 pr-4 border-r border-gray-800">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-white">{user.displayName}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-tighter">Security Level 4</p>
                </div>
                <img src={user.photoURL || ''} alt="" className="w-10 h-10 rounded-xl border border-gray-800" />
              </div>
              <button onClick={handleLogout} className="text-gray-500 hover:text-red-400 transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {/* Hero / Scan Section */}
        <section className="grid grid-cols-1 xl:grid-cols-12 gap-12 items-center">
          <div className="xl:col-span-7 space-y-8">
            <div>
              <h2 className="text-5xl font-black tracking-tighter mb-4 uppercase italic">
                Hardware <span className="text-cyan-500">Integrity</span> Audit
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl">
                Submit device metadata or firmware binaries for real-time analysis against our global threat intelligence database.
              </p>
            </div>
            <ScanZone onScan={handleScan} isScanning={isScanning} />
          </div>
          
          <div className="xl:col-span-5 bg-black/40 border border-gray-800 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-bold uppercase tracking-[0.3em] text-gray-500">Live 3D Visualization</h3>
              {currentScan && (
                <span className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                  currentScan.verdict === 'SAFE' ? "text-green-400" : currentScan.verdict === 'SUSPICIOUS' ? "text-yellow-400" : "text-red-400"
                )}>
                  {currentScan.verdict} DETECTED
                </span>
              )}
            </div>
            <USBVisualizer verdict={currentScan?.verdict || 'IDLE'} />
            {currentScan && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 p-4 bg-gray-900/50 rounded-2xl border border-gray-800"
              >
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Technical Verdict</p>
                <p className="text-sm text-gray-200 leading-relaxed">{currentScan.technicalReasoning}</p>
              </motion.div>
            )}
          </div>
        </section>

        {/* Dashboard Section */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-black tracking-tighter uppercase italic">Security <span className="text-cyan-500">Analytics</span></h2>
            <button className="text-xs font-bold text-cyan-500 hover:text-cyan-400 flex items-center gap-2 uppercase tracking-widest">
              Export PDF Report <Zap className="w-3 h-3" />
            </button>
          </div>
          <Dashboard scans={scans} currentScan={currentScan || undefined} />
        </section>
      </main>

      <ChatBot scanContext={currentScan} />

      <footer className="border-t border-gray-800 py-12 bg-black/50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3 opacity-50">
            <Shield className="w-6 h-6" />
            <span className="font-black tracking-tighter text-lg uppercase italic">TrustGuard AI</span>
          </div>
          <p className="text-gray-600 text-xs uppercase tracking-widest">
            © 2026 USB TrustGuard AI. All Rights Reserved. Hardware-Level Verification Enabled.
          </p>
          <div className="flex gap-6 text-gray-600 text-xs uppercase tracking-widest font-bold">
            <a href="#" className="hover:text-cyan-500 transition-colors">Documentation</a>
            <a href="#" className="hover:text-cyan-500 transition-colors">API Status</a>
            <a href="#" className="hover:text-cyan-500 transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
