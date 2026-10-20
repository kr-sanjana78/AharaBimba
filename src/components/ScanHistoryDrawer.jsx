import React from 'react';
import { History, X, Trash2, ArrowUpRight, ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';

export default function ScanHistoryDrawer({
  isOpen,
  onClose,
  history = [],
  onSelectHistoryItem,
  onClearHistory,
  isDarkMode
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div onClick={onClose} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className={`w-screen max-w-md p-6 flex flex-col justify-between overflow-y-auto border-l shadow-2xl transition-colors ${
          isDarkMode
            ? 'bg-slate-900 border-slate-800 text-white'
            : 'bg-white border-blue-100 text-slate-800'
        }`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold">Saved Food Scans</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {history.length === 0 ? (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <History className="w-10 h-10 mx-auto stroke-1 text-slate-300" />
                <p className="text-sm font-semibold">No saved scans yet.</p>
                <p className="text-xs">When you check a food packet, click "Save This Scan" to view it here anytime.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((item, index) => {
                  const isFlagged = item.status === 'flagged';
                  const isWarning = item.status === 'warning';

                  return (
                    <div
                      key={item.id || index}
                      onClick={() => {
                        onSelectHistoryItem(item);
                        onClose();
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 group ${
                        isDarkMode
                          ? 'bg-slate-800 border-slate-700 hover:bg-slate-750'
                          : 'bg-blue-50/40 border-blue-100 hover:bg-blue-50 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-slate-500">
                          {item.timestamp ? new Date(item.timestamp).toLocaleDateString() : 'Recent'}
                        </span>
                        <div>
                          {isFlagged ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                              Flagged
                            </span>
                          ) : isWarning ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                              Review
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                              Safe
                            </span>
                          )}
                        </div>
                      </div>

                      <h4 className={`text-sm font-bold group-hover:text-blue-600 transition-colors truncate ${
                        isDarkMode ? 'text-white' : 'text-slate-900'
                      }`}>
                        {item.verdict || 'Scanned Label'}
                      </h4>

                      <div className="flex items-center justify-between text-xs text-blue-600 font-semibold pt-1">
                        <span>View Result</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {history.length > 0 && (
            <div className="pt-4 border-t border-slate-200">
              <button
                onClick={onClearHistory}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear All History
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
