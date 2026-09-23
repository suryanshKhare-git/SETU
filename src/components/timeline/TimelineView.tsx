import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { TimelineEvent } from '../../types';
import {
  Clock,
  Phone,
  Truck,
  CreditCard,
  FileText,
  Eye,
  ExternalLink,
} from 'lucide-react';

export const TimelineView: React.FC = () => {
  const {
    timeline,
    entities,
    viewEntityProfile,
    inspectEvidenceByDocRef,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All Records', icon: <Clock className="w-3.5 h-3.5" /> },
    { id: 'telephony', label: 'Telephony & CDRs', icon: <Phone className="w-3.5 h-3.5" /> },
    { id: 'transit', label: 'Transit & Tolls', icon: <Truck className="w-3.5 h-3.5" /> },
    { id: 'financial', label: 'Banking & Hawala', icon: <CreditCard className="w-3.5 h-3.5" /> },
    { id: 'police_incident', label: 'Police Incidents / FIR', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'surveillance', label: 'CCTV & Surveillance', icon: <Eye className="w-3.5 h-3.5" /> },
  ];

  const filteredTimeline = useMemo(() => {
    if (selectedCategory === 'all') return timeline;
    return timeline.filter(item => item.category === selectedCategory);
  }, [timeline, selectedCategory]);

  const getCategoryBadge = (cat: TimelineEvent['category']) => {
    switch (cat) {
      case 'telephony':
        return { label: 'CDR Telephony', color: 'bg-teal-950/70 text-teal-300 border-teal-800' };
      case 'transit':
        return { label: 'Toll & Transit', color: 'bg-amber-950/70 text-amber-300 border-amber-800' };
      case 'financial':
        return { label: 'Banking & Hawala', color: 'bg-emerald-950/70 text-emerald-300 border-emerald-800' };
      case 'police_incident':
        return { label: 'Police Incident / FIR', color: 'bg-blue-950/70 text-blue-300 border-blue-800' };
      case 'surveillance':
        return { label: 'Optical CCTV Sighting', color: 'bg-purple-950/70 text-purple-300 border-purple-800' };
    }
  };

  const scrollToFirstEvent = () => {
    if (filteredTimeline.length > 0) {
      setSelectedEventId(filteredTimeline[0].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 animate-fadeIn text-slate-200">
      {/* Standardized Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-white tracking-tight">Chronological Incident Timeline</h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
              {filteredTimeline.length} Chronological Records
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Temporal alignment of CDR bursts, FASTag passages, RTGS transfers, and CCTV sightings
          </p>
        </div>

        {/* Primary Action Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={scrollToFirstEvent}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium transition shadow-sm"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Inspect Earliest Event</span>
          </button>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition border whitespace-nowrap ${
              selectedCategory === cat.id
                ? 'bg-teal-950 border-teal-500 text-teal-300 shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            {cat.icon}
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Vertical Chronological Timeline */}
      {filteredTimeline.length > 0 ? (
        <div className="relative pl-6 sm:pl-44 space-y-5 before:absolute before:left-2.5 sm:before:left-40 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
          {filteredTimeline.map((item, idx) => {
            const badge = getCategoryBadge(item.category);
            const isSelected = selectedEventId === item.id;

            return (
              <div
                key={item.id}
                className="relative group cursor-pointer"
                onClick={() => setSelectedEventId(item.id)}
              >
                {/* Left Date Label (Desktop) */}
                <div className="hidden sm:block absolute -left-44 top-1 w-36 text-right pr-4">
                  <span className="font-mono text-xs font-semibold text-slate-300 block">
                    {item.displayDate}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 block uppercase">
                    Record #{idx + 1}
                  </span>
                </div>

                {/* Timeline Dot on the Vertical Rail */}
                <div
                  className={`absolute -left-6 sm:-left-4 top-2 w-3 h-3 rounded-full border-2 transition -translate-x-1/2 ${
                    isSelected
                      ? 'bg-teal-400 border-white ring-2 ring-teal-500/40'
                      : 'bg-slate-950 border-teal-500 group-hover:border-white'
                  }`}
                />

                {/* Event Card */}
                <div
                  className={`p-4 rounded-lg border transition space-y-3 ${
                    isSelected
                      ? 'bg-slate-900/90 border-teal-600/70 shadow-md'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Top metadata row */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="sm:hidden font-mono text-xs font-bold text-teal-400">
                        {item.displayDate}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${badge.color}`}>
                        {badge.label}
                      </span>
                      <span className="text-[10px] font-mono text-amber-400 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                        {item.evidenceWeight}
                      </span>
                    </div>

                    <button
                      onClick={e => {
                        e.stopPropagation();
                        inspectEvidenceByDocRef(item.sourceDocRef);
                      }}
                      className="flex items-center gap-1.5 h-6 px-2 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-mono text-teal-300 hover:text-white transition"
                      title="Inspect primary source document citation"
                    >
                      <FileText className="w-3 h-3 text-teal-400" />
                      <span>Ex. [{item.sourceDocRef}]</span>
                    </button>
                  </div>

                  {/* Title & Narrative */}
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-white">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {item.summary}
                    </p>
                  </div>

                  {/* Involved Entities */}
                  {item.entityIds.length > 0 && (
                    <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-mono uppercase text-slate-500 mr-1">
                        Correlated Entities:
                      </span>
                      {item.entityIds.map(entId => {
                        const ent = entities.find(e => e.id === entId);
                        if (!ent) return null;

                        return (
                          <button
                            key={ent.id}
                            onClick={e => {
                              e.stopPropagation();
                              viewEntityProfile(ent.id);
                            }}
                            className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 transition"
                            title={`Inspect ${ent.name}`}
                          >
                            <span className="text-white font-medium">{ent.name}</span>
                            <span className="text-[10px] text-teal-400 font-mono">
                              ({ent.categoryLabel})
                            </span>
                            <ExternalLink className="w-3 h-3 text-slate-500" />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-12 text-center space-y-3 bg-slate-900/60 border border-slate-800 rounded-lg">
          <Clock className="w-8 h-8 text-slate-500 mx-auto" />
          <div className="text-sm font-semibold text-slate-200">No timeline events found in this category</div>
          <p className="text-xs text-slate-400">Try selecting another event filter to view chronological milestones.</p>
          <button
            onClick={() => setSelectedCategory('all')}
            className="h-8 px-3.5 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-teal-300 text-xs font-mono font-medium transition"
          >
            Reset to All Records
          </button>
        </div>
      )}
    </div>
  );
};
