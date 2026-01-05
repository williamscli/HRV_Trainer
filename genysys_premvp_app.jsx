import React, { useState, useEffect } from 'react';

const THRESHOLDS = {
  REST: -1.0,
  PERFORM: 0.5,
  MIN_DAYS: 7,
  MIN_PREVIEW_DAYS: 3,
  MAD_FLOOR: 3.0
};

const PRESCRIPTIONS = {
  REST: {
    color: '#EF4444',
    bg: 'rgba(239, 68, 68, 0.15)',
    headline: 'REST',
    prescription: 'Light movement only. Walk, stretch, or mobilize. No intense training today.',
    guidance: [
      'Prioritize 8+ hours of sleep tonight',
      'Keep heart rate under 120 bpm',
      'Focus on nutrition and hydration'
    ]
  },
  BUILD: {
    color: '#F59E0B',
    bg: 'rgba(245, 158, 11, 0.15)',
    headline: 'BUILD',
    prescription: 'Standard training day. Follow your program as planned.',
    guidance: [
      'Execute your scheduled workout',
      'Train at normal intensity',
      'Listen to your body for minor adjustments'
    ]
  },
  PERFORM: {
    color: '#10B981',
    bg: 'rgba(16, 185, 129, 0.15)',
    headline: 'PERFORM',
    prescription: 'System primed. Push hard today — PRs, competition, max effort.',
    guidance: [
      'Go for personal records',
      'High intensity is welcomed',
      'Your body can handle more today'
    ]
  },
  LEARNING: {
    color: '#6B7280',
    bg: 'rgba(107, 114, 128, 0.15)',
    headline: 'LEARNING',
    prescription: 'Building your baseline. Keep logging HRV daily.',
    guidance: [
      'Train normally while we learn your patterns',
      'Log HRV at the same time each morning',
      'Preview commands start after 3 days'
    ]
  }
};

function calculateMedian(arr) {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function calculateMAD(arr, median) {
  const deviations = arr.map(v => Math.abs(v - median)).sort((a, b) => a - b);
  const mad = calculateMedian(deviations);
  return Math.max(mad * 1.4826, THRESHOLDS.MAD_FLOOR);
}

function getCommandKey(zScore) {
  if (zScore === null) return 'LEARNING';
  if (zScore < THRESHOLDS.REST) return 'REST';
  if (zScore >= THRESHOLDS.PERFORM) return 'PERFORM';
  return 'BUILD';
}

function ZScoreChart({ zScore, baseline, mad }) {
  // Chart shows z-score from -3 to +3
  const minZ = -3;
  const maxZ = 3;
  const range = maxZ - minZ;
  
  // Clamp z-score for display
  const clampedZ = Math.max(minZ, Math.min(maxZ, zScore));
  const markerPosition = ((clampedZ - minZ) / range) * 100;
  
  // Zone boundaries as percentages
  const restEnd = ((-1 - minZ) / range) * 100;
  const buildEnd = ((0.5 - minZ) / range) * 100;
  
  // Calculate HRV values at zone boundaries for display
  const restHRV = Math.round(baseline + (-1 * mad));
  const performHRV = Math.round(baseline + (0.5 * mad));
  
  return (
    <div className="bg-slate-800 rounded-xl p-4 space-y-3">
      <div className="text-xs text-slate-500 uppercase tracking-wide text-center">Where You Are Today</div>
      
      {/* Zone labels */}
      <div className="flex text-xs font-medium">
        <div className="text-red-400" style={{ width: `${restEnd}%` }}>REST</div>
        <div className="text-amber-400" style={{ width: `${buildEnd - restEnd}%` }}>BUILD</div>
        <div className="text-green-400 text-right flex-1">PERFORM</div>
      </div>
      
      {/* Chart bar */}
      <div className="relative h-8 rounded-lg overflow-hidden">
        {/* Zone backgrounds */}
        <div className="absolute inset-0 flex">
          <div 
            className="h-full bg-red-500/30" 
            style={{ width: `${restEnd}%` }}
          />
          <div 
            className="h-full bg-amber-500/30" 
            style={{ width: `${buildEnd - restEnd}%` }}
          />
          <div 
            className="h-full bg-green-500/30 flex-1"
          />
        </div>
        
        {/* Zone divider lines */}
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-slate-600"
          style={{ left: `${restEnd}%` }}
        />
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-slate-600"
          style={{ left: `${buildEnd}%` }}
        />
        
        {/* Today's marker */}
        <div 
          className="absolute top-0 bottom-0 flex flex-col items-center transition-all duration-300"
          style={{ left: `${markerPosition}%`, transform: 'translateX(-50%)' }}
        >
          <div className="w-1 flex-1 bg-white rounded-full shadow-lg shadow-white/50" />
        </div>
      </div>
      
      {/* HRV scale labels */}
      <div className="flex justify-between text-xs text-slate-600">
        <span>{Math.round(baseline + (minZ * mad))}</span>
        <span className="text-slate-500">{restHRV}</span>
        <span className="text-slate-500">{performHRV}</span>
        <span>{Math.round(baseline + (maxZ * mad))}</span>
      </div>
      
      {/* Baseline indicator */}
      <div className="text-center text-xs text-slate-600">
        Your baseline: <span className="text-slate-400 font-mono">{Math.round(baseline)} ms</span>
        <span className="text-slate-700 mx-2">•</span>
        Range: <span className="text-slate-400 font-mono">{restHRV}–{performHRV} ms</span> is BUILD
      </div>
    </div>
  );
}

function exportToCSV(hrvHistory, complianceLog, userName, hrvSource) {
  // Merge HRV and compliance data by date
  const allDates = [...new Set([
    ...hrvHistory.map(h => h.date),
    ...complianceLog.map(c => c.date)
  ])].sort();
  
  const headers = ['Date', 'HRV (ms)', 'Command', 'Followed', 'Energy', 'Source'];
  const rows = allDates.map(date => {
    const hrv = hrvHistory.find(h => h.date === date);
    const compliance = complianceLog.find(c => c.date === date);
    return [
      date,
      hrv?.value || '',
      compliance?.command || '',
      compliance?.followed || '',
      compliance?.energy || '',
      hrvSource?.label || ''
    ];
  });
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `genysys_hrv_${userName || 'data'}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function GenysysPreMVP() {
  const [hrvHistory, setHrvHistory] = useState([]);
  const [complianceLog, setComplianceLog] = useState([]); // {date, command, followed, energy}
  const [todayHRV, setTodayHRV] = useState('');
  const [result, setResult] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [newEntry, setNewEntry] = useState('');
  const [newEntryDate, setNewEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [userName, setUserName] = useState('');
  const [hrvSource, setHrvSource] = useState(null); // {type: string, label: string}
  const [otherSourceText, setOtherSourceText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');

  const HRV_SOURCES = [
    { id: 'whoop', label: 'WHOOP' },
    { id: 'apple', label: 'Apple Watch' },
    { id: 'oura', label: 'Oura' },
    { id: 'garmin', label: 'Garmin' },
    { id: 'welltory', label: 'Welltory (Phone Camera)' },
    { id: 'other', label: 'Other' },
  ];

  useEffect(() => {
    async function loadData() {
      try {
        const result = await window.storage.get('genysys_user_data');
        if (result && result.value) {
          const data = JSON.parse(result.value);
          setHrvHistory(data.hrvHistory || []);
          setUserName(data.userName || '');
          setComplianceLog(data.complianceLog || []);
          setHrvSource(data.hrvSource || null);
        }
      } catch (err) {
        console.log('No existing data found');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (isLoading) return;
    async function saveData() {
      try {
        const data = { hrvHistory, userName, complianceLog, hrvSource };
        await window.storage.set('genysys_user_data', JSON.stringify(data));
        setSaveStatus('✓');
        setTimeout(() => setSaveStatus(''), 1500);
      } catch (err) {
        console.error('Failed to save:', err);
      }
    }
    saveData();
  }, [hrvHistory, userName, complianceLog, hrvSource, isLoading]);

  // Auto-calculate if today's data exists in history
  useEffect(() => {
    if (isLoading) return;
    
    const todayDate = new Date().toISOString().split('T')[0];
    const todayEntry = hrvHistory.find(h => h.date === todayDate);
    
    if (todayEntry) {
      setTodayHRV(todayEntry.value.toString());
      
      // Calculate command using history without today
      const historyWithoutToday = hrvHistory.filter(h => h.date !== todayDate);
      const values = historyWithoutToday.map(h => h.value);
      const isPreview = values.length >= THRESHOLDS.MIN_PREVIEW_DAYS && values.length < THRESHOLDS.MIN_DAYS;
      
      if (values.length < THRESHOLDS.MIN_PREVIEW_DAYS) {
        setResult({
          commandKey: 'LEARNING',
          baseline: null,
          mad: null,
          zScore: null,
          daysNeeded: THRESHOLDS.MIN_PREVIEW_DAYS - values.length,
          isPreview: false
        });
        // Ensure command is logged
        const existingLog = complianceLog.find(c => c.date === todayDate);
        if (!existingLog) {
          setComplianceLog(prev => [...prev, { date: todayDate, command: 'LEARNING', followed: null, energy: null }]);
        }
      } else {
        const median = calculateMedian(values);
        const mad = calculateMAD(values, median);
        const zScore = (todayEntry.value - median) / mad;
        const commandKey = getCommandKey(zScore);
        
        setResult({
          commandKey: commandKey,
          baseline: median,
          mad: mad,
          zScore: zScore,
          todayValue: todayEntry.value,
          isPreview: isPreview,
          daysUntilFull: isPreview ? THRESHOLDS.MIN_DAYS - values.length : 0
        });
        // Ensure command is logged
        const existingLog = complianceLog.find(c => c.date === todayDate);
        if (!existingLog) {
          setComplianceLog(prev => [...prev, { date: todayDate, command: commandKey, followed: null, energy: null }]);
        } else if (existingLog.command !== commandKey) {
          setComplianceLog(prev => prev.map(c => c.date === todayDate ? { ...c, command: commandKey } : c));
        }
      }
    }
  }, [isLoading, hrvHistory]);

  const addToHistory = () => {
    const val = parseFloat(newEntry);
    if (isNaN(val) || val <= 0) return;
    
    // Check if date already exists, update if so
    const existingIndex = hrvHistory.findIndex(h => h.date === newEntryDate);
    let newHistory;
    if (existingIndex >= 0) {
      newHistory = [...hrvHistory];
      newHistory[existingIndex] = { value: val, date: newEntryDate };
    } else {
      newHistory = [...hrvHistory, { value: val, date: newEntryDate }];
    }
    
    // Sort by date and keep last 14
    newHistory.sort((a, b) => new Date(a.date) - new Date(b.date));
    if (newHistory.length > 14) newHistory.shift();
    
    setHrvHistory(newHistory);
    setNewEntry('');
  };

  const removeFromHistory = (index) => {
    const actualIndex = hrvHistory.length - 1 - index;
    setHrvHistory(hrvHistory.filter((_, i) => i !== actualIndex));
  };

  const calculateCommand = () => {
    const today = parseFloat(todayHRV);
    if (isNaN(today) || today <= 0) {
      setResult({ error: 'Enter valid HRV' });
      return;
    }
    
    // Save today's HRV to history
    const todayDate = new Date().toISOString().split('T')[0];
    const existingIndex = hrvHistory.findIndex(h => h.date === todayDate);
    let updatedHistory;
    if (existingIndex >= 0) {
      updatedHistory = [...hrvHistory];
      updatedHistory[existingIndex] = { value: today, date: todayDate };
    } else {
      updatedHistory = [...hrvHistory, { value: today, date: todayDate }];
    }
    updatedHistory.sort((a, b) => new Date(a.date) - new Date(b.date));
    if (updatedHistory.length > 14) updatedHistory.shift();
    setHrvHistory(updatedHistory);
    
    // Calculate using history WITHOUT today (baseline from past days only)
    const historyWithoutToday = updatedHistory.filter(h => h.date !== todayDate);
    const values = historyWithoutToday.map(h => h.value);
    const isPreview = values.length >= THRESHOLDS.MIN_PREVIEW_DAYS && values.length < THRESHOLDS.MIN_DAYS;
    
    if (values.length < THRESHOLDS.MIN_PREVIEW_DAYS) {
      setResult({
        commandKey: 'LEARNING',
        baseline: null,
        mad: null,
        zScore: null,
        daysNeeded: THRESHOLDS.MIN_PREVIEW_DAYS - values.length,
        isPreview: false
      });
      // Log LEARNING command
      logTodayCommand('LEARNING');
      return;
    }

    const median = calculateMedian(values);
    const mad = calculateMAD(values, median);
    const zScore = (today - median) / mad;
    const commandKey = getCommandKey(zScore);
    
    setResult({
      commandKey: commandKey,
      baseline: median,
      mad: mad,
      zScore: zScore,
      todayValue: today,
      isPreview: isPreview,
      daysUntilFull: isPreview ? THRESHOLDS.MIN_DAYS - values.length : 0
    });
    
    // Log today's command
    logTodayCommand(commandKey);
  };

  const logTodayCommand = (commandKey) => {
    const todayDate = new Date().toISOString().split('T')[0];
    const existingIndex = complianceLog.findIndex(c => c.date === todayDate);
    
    if (existingIndex >= 0) {
      // Update command but preserve compliance/energy if already set
      const updated = [...complianceLog];
      updated[existingIndex] = { ...updated[existingIndex], command: commandKey };
      setComplianceLog(updated);
    } else {
      setComplianceLog([...complianceLog, { date: todayDate, command: commandKey, followed: null, energy: null }]);
    }
  };

  // Get yesterday's data
  const getYesterdayData = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayDate = yesterday.toISOString().split('T')[0];
    return complianceLog.find(c => c.date === yesterdayDate);
  };

  // Check if we need to ask about yesterday
  const yesterdayData = getYesterdayData();
  const needsYesterdayCompliance = yesterdayData && yesterdayData.command && yesterdayData.command !== 'LEARNING' && yesterdayData.followed === null;

  // Check if today's energy is logged
  const todayDate = new Date().toISOString().split('T')[0];
  const todayCompliance = complianceLog.find(c => c.date === todayDate);
  const needsEnergyInput = todayCompliance && todayCompliance.command && todayCompliance.energy === null;

  const recordYesterdayCompliance = (followed) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayDate = yesterday.toISOString().split('T')[0];
    
    const updated = complianceLog.map(c => 
      c.date === yesterdayDate ? { ...c, followed } : c
    );
    setComplianceLog(updated);
  };

  const recordTodayEnergy = (energy) => {
    const todayDate = new Date().toISOString().split('T')[0];
    const existingIndex = complianceLog.findIndex(c => c.date === todayDate);
    
    if (existingIndex >= 0) {
      const updated = [...complianceLog];
      updated[existingIndex] = { ...updated[existingIndex], energy };
      setComplianceLog(updated);
    }
  };

  const clearHistory = () => {
    setHrvHistory([]);
    setComplianceLog([]);
    setResult(null);
  };

  const resetAll = async () => {
    try {
      await window.storage.delete('genysys_user_data');
      setHrvHistory([]);
      setComplianceLog([]);
      setUserName('');
      setHrvSource(null);
      setResult(null);
      setTodayHRV('');
    } catch (err) {
      console.error('Failed to reset:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  // Onboarding: Ask for HRV source
  if (!hrvSource) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-4">
        <div className="max-w-md mx-auto space-y-6 pt-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Welcome</h1>
            <p className="text-slate-400">Your nervous system tells us how recovered you are.</p>
            <p className="text-slate-400">We read it. We tell you what to do.</p>
          </div>
          
          <div className="pt-4">
            <div className="text-sm text-slate-500 uppercase tracking-wide mb-3">Where do you get your HRV?</div>
            <div className="space-y-2">
              {HRV_SOURCES.map(source => (
                <button
                  key={source.id}
                  onClick={() => source.id !== 'other' && setHrvSource({ type: source.id, label: source.label })}
                  className={`w-full text-left px-4 py-3 rounded-lg transition ${
                    source.id === 'other' 
                      ? 'bg-slate-800/50 text-slate-400' 
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                >
                  {source.label}
                </button>
              ))}
            </div>
            
            {/* Other input */}
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={otherSourceText}
                onChange={(e) => setOtherSourceText(e.target.value)}
                placeholder="Other source..."
                className="flex-1 bg-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => otherSourceText.trim() && setHrvSource({ type: 'other', label: otherSourceText.trim() })}
                disabled={!otherSourceText.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 rounded-lg px-4 py-3 font-medium transition"
              >
                Go
              </button>
            </div>
          </div>

          <div className="text-center text-slate-600 text-xs pt-8">
            Don't have a wearable? Use <span className="text-slate-400">Welltory</span> (free) with your phone camera.
          </div>
        </div>
      </div>
    );
  }

  const prescription = result && !result.error ? PRESCRIPTIONS[result.commandKey] : null;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4">
      <div className="max-w-md mx-auto space-y-4">
        
        {/* Minimal Header - just save status and name */}
        <div className="flex items-center justify-between pt-2 pb-1">
          <div className="text-xs text-slate-600">{hrvSource?.label}</div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            {saveStatus && <span className="text-green-400">{saveStatus}</span>}
            {userName && <span>{userName}</span>}
          </div>
        </div>

        {/* Yesterday's Compliance Prompt */}
        {needsYesterdayCompliance && (
          <div className="bg-slate-800 rounded-xl p-4 space-y-3">
            <div className="text-center">
              <div className="text-slate-400 text-sm">Yesterday was</div>
              <div 
                className="text-2xl font-bold"
                style={{ color: PRESCRIPTIONS[yesterdayData.command]?.color || '#6B7280' }}
              >
                {yesterdayData.command}
              </div>
              <div className="text-slate-500 text-sm mt-2">Did you follow it?</div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => recordYesterdayCompliance('yes')}
                className="flex-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg py-2 text-sm font-medium transition"
              >
                Yes
              </button>
              <button
                onClick={() => recordYesterdayCompliance('partial')}
                className="flex-1 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 rounded-lg py-2 text-sm font-medium transition"
              >
                Partial
              </button>
              <button
                onClick={() => recordYesterdayCompliance('no')}
                className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg py-2 text-sm font-medium transition"
              >
                No
              </button>
            </div>
          </div>
        )}

        {/* Today's Energy Prompt (optional, shows after command is set) */}
        {needsEnergyInput && !needsYesterdayCompliance && (
          <div className="bg-slate-800/50 rounded-xl p-4 space-y-3">
            <div className="text-center text-slate-500 text-sm">How's your energy today?</div>
            <div className="flex gap-2">
              <button
                onClick={() => recordTodayEnergy('low')}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg py-2 text-sm transition"
              >
                Low
              </button>
              <button
                onClick={() => recordTodayEnergy('normal')}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg py-2 text-sm transition"
              >
                Normal
              </button>
              <button
                onClick={() => recordTodayEnergy('high')}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg py-2 text-sm transition"
              >
                High
              </button>
            </div>
            <button
              onClick={() => recordTodayEnergy('skipped')}
              className="w-full text-slate-600 text-xs py-1 hover:text-slate-500"
            >
              Skip
            </button>
          </div>
        )}

        {/* HERO: Today's Command */}
        {prescription && (
          <div 
            className="rounded-2xl p-6 space-y-4"
            style={{ backgroundColor: prescription.bg, border: `1px solid ${prescription.color}30` }}
          >
            {/* Preview badge */}
            {result.isPreview && (
              <div className="text-center">
                <span className="inline-block bg-slate-700 text-slate-300 text-xs px-3 py-1 rounded-full">
                  Preview Mode
                </span>
              </div>
            )}

            {/* Command Badge */}
            <div className="text-center">
              <div 
                className="text-6xl font-black tracking-tighter"
                style={{ color: prescription.color }}
              >
                {prescription.headline}
              </div>
              <div className="text-slate-300 text-lg mt-2 font-medium">
                {prescription.prescription}
              </div>
            </div>

            {/* Guidance */}
            <div className="space-y-2 pt-2">
              {prescription.guidance.map((item, i) => (
                <div key={i} className="flex items-start gap-3 text-slate-400 text-sm">
                  <span style={{ color: prescription.color }}>→</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* Preview disclaimer */}
            {result.isPreview && (
              <div className="text-center text-slate-500 text-xs pt-2 border-t border-slate-700/50">
                Based on limited data — accuracy improves in {result.daysUntilFull} more day{result.daysUntilFull !== 1 ? 's' : ''}
              </div>
            )}

            {/* Stats (subtle) - full mode */}
            {result.zScore !== null && !result.isPreview && (
              <div className="flex justify-center gap-8 pt-3 text-xs text-slate-500 border-t border-slate-700/50 mt-4">
                <div className="text-center">
                  <div className="font-mono text-slate-400 text-lg">{Math.round(result.baseline)}</div>
                  <div>baseline</div>
                </div>
                <div className="text-center">
                  <div className="font-mono text-slate-400 text-lg">{Math.round(result.todayValue)}</div>
                  <div>today</div>
                </div>
              </div>
            )}

            {/* Stats (subtle) - preview mode */}
            {result.zScore !== null && result.isPreview && (
              <div className="flex justify-center gap-8 pt-2 text-xs text-slate-600">
                <div className="text-center">
                  <div className="font-mono text-slate-500">{Math.round(result.baseline)}</div>
                  <div>baseline</div>
                </div>
                <div className="text-center">
                  <div className="font-mono text-slate-500">{Math.round(result.todayValue)}</div>
                  <div>today</div>
                </div>
              </div>
            )}

            {result.daysNeeded && (
              <div className="text-center text-amber-400 text-sm pt-2">
                {result.daysNeeded} more day{result.daysNeeded > 1 ? 's' : ''} until preview commands
              </div>
            )}
          </div>
        )}

        {/* Z-Score Chart */}
        {result && !result.error && result.zScore !== null && (
          <ZScoreChart 
            zScore={result.zScore} 
            baseline={result.baseline} 
            mad={result.mad} 
          />
        )}

        {/* Empty state before calculation */}
        {!result && (
          <div className="rounded-2xl p-8 bg-slate-800/50 text-center">
            <div className="text-slate-500 text-lg">Enter today's HRV below</div>
            <div className="text-slate-600 text-sm mt-1">to get your command</div>
          </div>
        )}

        {result?.error && (
          <div className="bg-red-900/30 text-red-400 rounded-xl p-4 text-center">
            {result.error}
          </div>
        )}

        {/* Today's HRV Input */}
        <div className="bg-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-xs text-slate-500 uppercase tracking-wide">Today's HRV (ms)</label>
            <span className="text-xs text-slate-600">{new Date().toLocaleDateString()}</span>
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              value={todayHRV}
              onChange={(e) => setTodayHRV(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && calculateCommand()}
              placeholder="e.g., 55"
              className="flex-1 bg-slate-700 rounded-lg px-4 py-3 text-xl text-center font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={calculateCommand}
              className="bg-blue-600 hover:bg-blue-700 rounded-lg px-6 py-3 font-semibold transition"
            >
              GO
            </button>
          </div>
        </div>

        {/* HRV History */}
        <div className="bg-slate-800/50 rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500 uppercase tracking-wide">
              Baseline History ({hrvHistory.length}/14)
            </span>
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="text-blue-400 text-xs"
            >
              {showHistory ? 'Hide' : 'Show'}
            </button>
          </div>

          {/* Progress */}
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden relative">
            <div 
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${Math.min((hrvHistory.length / 7) * 100, 100)}%` }}
            />
            {/* 3-day marker */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-slate-500"
              style={{ left: `${(3/7)*100}%` }}
            />
          </div>
          <div className="text-xs text-slate-600 text-center">
            {hrvHistory.length >= 7 
              ? '✓ Full baseline established' 
              : hrvHistory.length >= 3
                ? `✓ Preview active — ${7 - hrvHistory.length} more days for full accuracy`
                : `${3 - hrvHistory.length} more day${3 - hrvHistory.length !== 1 ? 's' : ''} until preview commands`}
          </div>

          {/* Add entry */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="number"
                value={newEntry}
                onChange={(e) => setNewEntry(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addToHistory()}
                placeholder="HRV value"
                className="flex-1 bg-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                value={newEntryDate}
                onChange={(e) => setNewEntryDate(e.target.value)}
                className="bg-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={addToHistory}
                className="bg-slate-600 hover:bg-slate-500 rounded-lg px-4 py-2 text-sm transition"
              >
                Add
              </button>
            </div>
            <div className="text-xs text-slate-600 text-center">
              Add past HRV readings to build your baseline faster
            </div>
          </div>

          {/* History list */}
          {showHistory && hrvHistory.length > 0 && (
            <div className="space-y-1 pt-2 max-h-40 overflow-y-auto">
              {[...hrvHistory].reverse().map((entry, i) => {
                const isToday = entry.date === new Date().toISOString().split('T')[0];
                return (
                  <div key={i} className="flex justify-between items-center text-xs text-slate-500 py-1 border-b border-slate-700/50">
                    <span className="flex items-center gap-2">
                      {entry.date}
                      {isToday && <span className="text-blue-400 text-[10px]">today</span>}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-slate-400">{entry.value}</span>
                      <button 
                        onClick={() => removeFromHistory(i)}
                        className="text-red-400/60 hover:text-red-400"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {hrvHistory.length > 0 && (
            <button
              onClick={clearHistory}
              className="w-full text-red-400/60 text-xs py-1 hover:text-red-400"
            >
              Clear History
            </button>
          )}
        </div>

        {/* Settings */}
        <div className="bg-slate-800/30 rounded-xl p-3">
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Your name (for tracking)"
            className="w-full bg-transparent text-sm text-slate-400 focus:outline-none placeholder-slate-600"
          />
        </div>

        {/* Export & Reset */}
        <div className="flex gap-2">
          {hrvHistory.length > 0 && (
            <button
              onClick={() => exportToCSV(hrvHistory, complianceLog, userName, hrvSource)}
              className="flex-1 bg-slate-800 text-slate-400 text-xs py-2 rounded-lg hover:bg-slate-700 transition"
            >
              Export CSV
            </button>
          )}
          <button
            onClick={resetAll}
            className="flex-1 text-slate-600 text-xs py-2 hover:text-red-400 transition"
          >
            Reset All Data
          </button>
        </div>
      </div>
    </div>
  );
}
