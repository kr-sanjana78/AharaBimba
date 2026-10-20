import React, { useState } from 'react';
import { ALLERGEN_CATEGORIES, DIET_PRESETS } from '../data/ingredientsData';
import { Check, Plus, X, SlidersHorizontal, ShieldAlert, Sparkles, Info } from 'lucide-react';

export default function FilterSelector({
  selectedFilterIds,
  onToggleFilter,
  onSelectPreset,
  customFilters,
  onAddCustomFilter,
  onRemoveCustomFilter,
  onClearAll
}) {
  const [customInput, setCustomInput] = useState('');

  const handleAddCustom = (e) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    onAddCustomFilter(customInput.trim());
    setCustomInput('');
  };

  return (
    <div className="w-full glass-panel rounded-3xl p-6 sm:p-8 space-y-6 border border-[#52B788]/25 shadow-xl">
      {/* Header and Quick Presets */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#52B788]/20">
        <div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-[#52B788]" />
            <h3 className="text-xl font-bold text-[#FAF9F6] tracking-tight">
              Personalized Dietary & Allergen Filters
            </h3>
          </div>
          <p className="text-sm text-[#D8F3DC]/70 mt-1">
            Choose what you want LabelLens to detect and flag on the packaging photo.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="text-xs px-3 py-1.5 rounded-full bg-[#1B4332] text-[#74C69D] font-semibold border border-[#52B788]/30">
            {selectedFilterIds.length + customFilters.length} Active Checks
          </span>
          {(selectedFilterIds.length > 0 || customFilters.length > 0) && (
            <button
              onClick={onClearAll}
              className="text-xs text-[#D8F3DC]/60 hover:text-rose-300 underline underline-offset-2 transition-colors"
            >
              Reset all
            </button>
          )}
        </div>
      </div>

      {/* Preset Diet Profiles */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#52B788] uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5 text-[#E9B949]" />
          <span>Quick Diet Profiles</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {DIET_PRESETS.map((preset) => {
            const isActive = preset.filterIds.every(id => selectedFilterIds.includes(id));
            return (
              <button
                key={preset.id}
                onClick={() => onSelectPreset(preset.filterIds)}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                  isActive
                    ? 'bg-[#2D6A4F] text-[#FAF9F6] border-[#52B788] shadow-md shadow-[#52B788]/20 ring-1 ring-[#52B788]'
                    : 'bg-[#12372A]/70 text-[#D8F3DC] border-[#52B788]/20 hover:bg-[#1B4332] hover:border-[#52B788]/40'
                }`}
                title={preset.description}
              >
                <span className="text-2xl mb-1">{preset.icon}</span>
                <span className="text-xs font-semibold leading-tight line-clamp-1">{preset.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Allergen Category Grid */}
      <div>
        <label className="block text-xs font-semibold text-[#52B788] uppercase tracking-wider mb-3">
          Standard Dietary & Allergen Categories
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ALLERGEN_CATEGORIES.map((cat) => {
            const isChecked = selectedFilterIds.includes(cat.id);
            return (
              <div
                key={cat.id}
                onClick={() => onToggleFilter(cat.id)}
                className={`cursor-pointer p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                  isChecked
                    ? 'bg-[#1B4332]/90 border-[#52B788] ring-1 ring-[#52B788]/50 shadow-lg'
                    : 'bg-[#0E291E]/60 border-[#52B788]/15 hover:bg-[#12372A]/80 hover:border-[#52B788]/30'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center mt-0.5 shrink-0 border transition-colors ${
                    isChecked
                      ? 'bg-[#52B788] border-[#52B788] text-[#0B1E16]'
                      : 'border-[#52B788]/40 bg-[#0B1E16]/40 text-transparent'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg">{cat.icon}</span>
                    <span className="text-sm font-bold text-[#FAF9F6]">{cat.name}</span>
                  </div>
                  <p className="text-xs text-[#D8F3DC]/70 mt-1 line-clamp-2">
                    {cat.description}
                  </p>
                  <p className="text-[11px] text-[#74C69D] mt-1.5 font-medium">
                    {cat.kannada}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Keyword Filter Input */}
      <div className="pt-2">
        <label className="block text-xs font-semibold text-[#52B788] uppercase tracking-wider mb-2">
          Add Custom Ingredient Checks
        </label>
        <form onSubmit={handleAddCustom} className="flex gap-2">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="e.g. Palm oil, MSG, Sesame, Tartrazine, Garlic..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#0B1E16]/70 border border-[#52B788]/30 text-sm text-[#FAF9F6] placeholder-[#D8F3DC]/40 focus:outline-none focus:border-[#52B788] focus:ring-1 focus:ring-[#52B788]"
          />
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#2D6A4F] hover:bg-[#52B788] text-[#FAF9F6] hover:text-[#0B1E16] font-semibold text-sm transition-colors shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </form>

        {/* Custom Tag Badges */}
        {customFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {customFilters.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium bg-[#1B4332] text-[#74C69D] border border-[#52B788]/30"
              >
                <span>{tag}</span>
                <button
                  onClick={() => onRemoveCustomFilter(tag)}
                  className="hover:text-rose-400 p-0.5 rounded-full"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Transparent Limitation Disclaimer */}
      <div className="p-3.5 rounded-2xl bg-[#0B1E16]/50 border border-[#52B788]/15 flex items-start gap-2.5 text-xs text-[#D8F3DC]/70">
        <Info className="w-4 h-4 text-[#74C69D] shrink-0 mt-0.5" />
        <span>
          <strong>Transparency Notice:</strong> Selected filters are rule-based checks. They do not constitute medical certification or replace consulting physical packaging for cross-contamination risks.
        </span>
      </div>
    </div>
  );
}
