import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { EntityType } from '../../types';
import {
  Search,
  User,
  Phone,
  Truck,
  CreditCard,
  MapPin,
  FileText,
  Pin,
  Share2,
  ExternalLink,
  Cpu,
  Filter,
  Sparkles,
  Compass,
  Shield,
  Building2,
  Plus,
  Table as TableIcon,
  LayoutGrid,
} from 'lucide-react';
import { AIAnalysisService, StructuredQueryResult } from '../../services/aiAnalysisService';

export const UniversalSearch: React.FC = () => {
  const {
    entities,
    edges,
    rawRecords,
    searchQuery,
    setSearchQuery,
    setActiveView,
    viewEntityProfile,
    selectEntity,
    pinToWorkspace,
    inspectEvidenceByDocRef,
    highlightEvidenceInGraph,
    setAddDataModalOpen,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Auto-detect entity type heuristic based on query string
  const detectedTypeSuggestion = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;

    if (/^(\+91|91)?[6-9]\d{2,}/.test(q) || /^\d{10,15}$/.test(q)) {
      return {
        type: 'phone' as EntityType,
        label: 'Detected: Telephony MSISDN / CDR Record',
        icon: <Phone className="w-3.5 h-3.5 text-teal-400" />,
      };
    }
    if (/^(dl|hr|up|mh|ka|gj|pb)[0-9a-z\s-]{2,}/i.test(q)) {
      return {
        type: 'vehicle' as EntityType,
        label: 'Detected: Vehicle Registration / Vahan Plate',
        icon: <Truck className="w-3.5 h-3.5 text-amber-400" />,
      };
    }
    if (q.startsWith('fir') || q.startsWith('case') || q.startsWith('gd')) {
      return {
        type: 'case' as EntityType,
        label: 'Detected: Police FIR / Criminal Docket ID',
        icon: <FileText className="w-3.5 h-3.5 text-blue-400" />,
      };
    }
    if (q.includes('hdfc') || q.includes('axis') || q.includes('a/c') || q.includes('bank') || /^\d{6,}/.test(q)) {
      return {
        type: 'account' as EntityType,
        label: 'Detected: Financial Bank Account / Hawala Ledger',
        icon: <CreditCard className="w-3.5 h-3.5 text-emerald-400" />,
      };
    }
    if (q.includes('ltd') || q.includes('pvt') || q.includes('cargo') || q.includes('freight') || q.includes('logistics') || q.includes('infratech') || q.includes('corp')) {
      return {
        type: 'organization' as EntityType,
        label: 'Detected: Commercial Enterprise / Shell Entity',
        icon: <Building2 className="w-3.5 h-3.5 text-indigo-400" />,
      };
    }
    if (q.includes('sector') || q.includes('toll') || q.includes('plaza') || q.includes('chowk') || q.includes('road')) {
      return {
        type: 'location' as EntityType,
        label: 'Detected: Geographic Location / Cell Tower Zone',
        icon: <MapPin className="w-3.5 h-3.5 text-purple-400" />,
      };
    }
    return {
      type: 'person' as EntityType,
      label: 'Target Query: Name / Known Alias / Subject',
      icon: <User className="w-3.5 h-3.5 text-cyan-400" />,
    };
  }, [searchQuery]);

  // AI Natural Language Structured Query Assist (Requirement 11, 20)
  const structuredResult: StructuredQueryResult | null = useMemo(() => {
    const q = searchQuery.trim();
    if (!q || q.length < 3) return null;
    return AIAnalysisService.runStructuredQuery(q, entities, edges, rawRecords);
  }, [searchQuery, entities, edges, rawRecords]);

  // Filter entities
  const filteredEntities = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return entities.filter(entity => {
      // Category filter
      if (selectedCategory !== 'all' && entity.type !== selectedCategory) {
        return false;
      }
      if (!q) return true;

      // Text matches across name, identifier, summary, aliases, tags
      const matchName = entity.name.toLowerCase().includes(q);
      const matchId = entity.primaryIdentifier.toLowerCase().includes(q);
      const matchSummary = entity.summary.toLowerCase().includes(q);
      const matchAliases = entity.aliases?.some(a => a.toLowerCase().includes(q)) ?? false;
      const matchTags = entity.tags.some(t => t.toLowerCase().includes(q));

      return matchName || matchId || matchSummary || matchAliases || matchTags;
    });
  }, [entities, searchQuery, selectedCategory]);

  const getEntityIcon = (type: EntityType) => {
    switch (type) {
      case 'person':
        return <User className="w-4 h-4 text-cyan-400" />;
      case 'organization':
        return <Building2 className="w-4 h-4 text-indigo-400" />;
      case 'phone':
        return <Phone className="w-4 h-4 text-teal-400" />;
      case 'vehicle':
        return <Truck className="w-4 h-4 text-amber-400" />;
      case 'account':
        return <CreditCard className="w-4 h-4 text-emerald-400" />;
      case 'location':
        return <MapPin className="w-4 h-4 text-purple-400" />;
      case 'case':
        return <FileText className="w-4 h-4 text-blue-400" />;
      default:
        return <Shield className="w-4 h-4 text-slate-400" />;
    }
  };

  const getBadgeStyle = (type: EntityType) => {
    switch (type) {
      case 'person':
        return 'bg-cyan-950/60 text-cyan-300 border-cyan-800/60';
      case 'organization':
        return 'bg-indigo-950/60 text-indigo-300 border-indigo-800/60';
      case 'phone':
        return 'bg-teal-950/60 text-teal-300 border-teal-800/60';
      case 'vehicle':
        return 'bg-amber-950/60 text-amber-300 border-amber-800/60';
      case 'account':
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60';
      case 'location':
        return 'bg-purple-950/60 text-purple-300 border-purple-800/60';
      case 'case':
        return 'bg-blue-950/60 text-blue-300 border-blue-800/60';
      default:
        return 'bg-slate-900 text-slate-300 border-slate-700';
    }
  };

  const handleInspectOnGraph = (entityId: string) => {
    selectEntity(entityId);
    setActiveView('graph');
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 animate-fadeIn">
      {/* Standardized Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-white tracking-tight">Entities & Universal Search</h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700 text-slate-300">
              {entities.length} Indexed Entities
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Search and resolve suspects, communications, vehicles, and accounts across dockets
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-md p-0.5 text-xs">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition ${
                viewMode === 'table' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Table View (Dense & Scannable)"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition ${
                viewMode === 'cards' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Card View (Detailed Dossiers)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
          </div>

          {/* ONE Primary Action Button */}
          <button
            onClick={() => setAddDataModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add / Ingest Data</span>
          </button>
        </div>
      </div>

      {/* Search Input Omnibox */}
      <div className="space-y-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-teal-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by suspect name, phone (+91), vehicle plate (DL-01), bank A/C, location, or case ID..."
            className="w-full pl-11 pr-28 py-2.5 bg-slate-900/90 border border-slate-700 focus:border-teal-500 rounded-md text-sm text-white placeholder-slate-500 focus:outline-none transition font-sans"
            autoFocus
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1.5">
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs px-2 py-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
              >
                Clear
              </button>
            )}
            <kbd className="px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-950 rounded border border-slate-800 hidden sm:inline-block">
              ESC
            </kbd>
          </div>
        </div>

        {/* Suggested Queries Chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] font-mono text-teal-400 font-semibold flex items-center gap-1 mr-1">
            <Sparkles className="w-3 h-3" />
            <span>Suggested:</span>
          </span>
          {[
            'Who is Vikram Singh connected to?',
            'What are the strongest relationships in this case?',
            'Which entities appeared near Jewar Toll Plaza?',
            'Show financial transfers linked to Hawala disbursement',
          ].map(prompt => (
            <button
              key={prompt}
              onClick={() => setSearchQuery(prompt)}
              className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-[11px] text-slate-300 hover:text-white transition font-sans"
            >
              "{prompt}"
            </button>
          ))}
        </div>

        {/* Auto-detected Entity Suggestion Banner */}
        {detectedTypeSuggestion && searchQuery.trim().length > 1 && (
          <div className="flex items-center justify-between px-3.5 py-2 rounded-md bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-teal-400" />
              <span className="font-mono text-slate-400">Pattern Match:</span>
              <span className="flex items-center gap-1.5 font-medium text-teal-300">
                {detectedTypeSuggestion.icon}
                {detectedTypeSuggestion.label}
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
              Matches: {filteredEntities.length} entities
            </span>
          </div>
        )}

        {/* Quick Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1 text-xs">
          <span className="text-slate-400 text-xs flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {[
            { id: 'all', label: `All (${entities.length})` },
            { id: 'person', label: `Persons (${entities.filter(e => e.type === 'person').length})` },
            { id: 'organization', label: `Organizations (${entities.filter(e => e.type === 'organization').length})` },
            { id: 'phone', label: `CDRs / Phones (${entities.filter(e => e.type === 'phone').length})` },
            { id: 'vehicle', label: `Vehicles (${entities.filter(e => e.type === 'vehicle').length})` },
            { id: 'account', label: `Financials (${entities.filter(e => e.type === 'account').length})` },
            { id: 'location', label: `Locations (${entities.filter(e => e.type === 'location').length})` },
            { id: 'case', label: `Cases (${entities.filter(e => e.type === 'case').length})` },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition whitespace-nowrap border ${
                selectedCategory === cat.id
                  ? 'bg-teal-950/80 border-teal-600 text-teal-300 shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* AI Structured Query Assist Result Card (Quiet Enterprise Style) */}
      {structuredResult && searchQuery.trim().length >= 4 && (
        <div className="p-4 rounded-lg bg-[#0e1524] border border-slate-800 space-y-3 font-sans animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-teal-950 border border-teal-700/60 text-teal-400">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-mono font-bold text-teal-300 uppercase tracking-wider">
                Natural Language Query Interpretation
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                {structuredResult.intent}
              </span>
            </div>
            {structuredResult.confidenceScore && (
              <span className="text-xs font-mono text-teal-300 font-semibold">
                {structuredResult.confidenceScore}% Confidence
              </span>
            )}
          </div>

          {/* Structured Answer Text */}
          <div className="p-3 rounded bg-slate-900/80 border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans">
            {structuredResult.answerText}
          </div>

          {/* Target Entities Chips & Graph Focus */}
          {structuredResult.targetEntities.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Correlated Entities in Docket:</span>
              <div className="flex flex-wrap gap-2">
                {structuredResult.targetEntities.map(ent => (
                  <button
                    key={ent.id}
                    onClick={() => {
                      selectEntity(ent.id);
                      setActiveView('graph');
                    }}
                    className="flex items-center gap-2 p-1.5 px-2.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-white transition group"
                  >
                    <span className="font-semibold group-hover:text-teal-300">{ent.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">({ent.categoryLabel})</span>
                    <Compass className="w-3 h-3 text-teal-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Supporting Evidence Records */}
          {structuredResult.supportingRecords.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800 text-[11px] font-mono">
              <span className="text-slate-400">Supporting Records:</span>
              {structuredResult.supportingRecords.map(rec => (
                <div
                  key={rec.id}
                  className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900 border border-slate-800"
                >
                  <button
                    onClick={() => inspectEvidenceByDocRef(rec.id)}
                    className="text-teal-400 hover:underline flex items-center gap-1"
                    title="Inspect Primary Evidence Docket"
                  >
                    <FileText className="w-3 h-3" />
                    <span>{rec.documentNumber} ({rec.title})</span>
                  </button>
                  <button
                    onClick={() => {
                      highlightEvidenceInGraph(rec.id, rec.extractedEntities, rec.title);
                      setActiveView('graph');
                    }}
                    className="p-0.5 text-slate-400 hover:text-teal-300 hover:bg-slate-800 rounded transition"
                    title="Focus Subgraph on Canvas"
                  >
                    <Share2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>Showing {filteredEntities.length} of {entities.length} entities</span>
        <span className="font-mono text-[11px] text-slate-500">Chain of Custody Active</span>
      </div>

      {/* Results Display: Table View (Default) or Card View */}
      {filteredEntities.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-lg space-y-2">
          <Search className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-sm text-slate-300 font-medium">No matching entities found in current case repository</p>
          <p className="text-xs text-slate-400">
            Try searching by phone digits (+91 98110...), vehicle plate (DL-01...), suspect name (Vikram), or bank A/C.
          </p>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW (Requirement 20: default dense scannable view) */
        <div className="bg-slate-900/70 border border-slate-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase">
                  <th className="py-2.5 px-4 font-semibold">Entity / Name</th>
                  <th className="py-2.5 px-3 font-semibold">Type</th>
                  <th className="py-2.5 px-3 font-semibold">Identifier</th>
                  <th className="py-2.5 px-3 font-semibold">Jurisdiction</th>
                  <th className="py-2.5 px-3 font-semibold">Last Sighted</th>
                  <th className="py-2.5 px-3 font-semibold">Risk / Flag</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredEntities.map(entity => (
                  <tr
                    key={entity.id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded bg-slate-800/80 border border-slate-700/60 shrink-0">
                          {getEntityIcon(entity.type)}
                        </div>
                        <div>
                          <button
                            onClick={() => viewEntityProfile(entity.id)}
                            className="font-medium text-white group-hover:text-teal-300 text-left transition"
                          >
                            {entity.name}
                          </button>
                          {entity.aliases && entity.aliases.length > 0 && (
                            <div className="text-[10px] text-slate-500 font-mono">
                              aka {entity.aliases[0]}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono border ${getBadgeStyle(entity.type)}`}>
                        {entity.categoryLabel}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-300">
                      {entity.primaryIdentifier}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 text-xs">
                      {entity.jurisdiction || 'NCR Jurisdiction'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">
                      {entity.lastSighted}
                    </td>
                    <td className="py-2.5 px-3">
                      {entity.riskLevel ? (
                        <span className={`inline-flex items-center gap-1 text-[11px] font-mono ${
                          entity.riskLevel === 'HIGH'
                            ? 'text-red-400'
                            : entity.riskLevel === 'MEDIUM'
                            ? 'text-amber-400'
                            : 'text-slate-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            entity.riskLevel === 'HIGH'
                              ? 'bg-red-500'
                              : entity.riskLevel === 'MEDIUM'
                              ? 'bg-amber-400'
                              : 'bg-slate-500'
                          }`} />
                          {entity.riskLevel} {entity.riskScore ? `(${entity.riskScore})` : ''}
                        </span>
                      ) : (
                        <span className="text-slate-500 font-mono text-[11px]">Standard</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => viewEntityProfile(entity.id)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
                          title="View Entity Profile"
                        >
                          Profile
                        </button>
                        <button
                          onClick={() => handleInspectOnGraph(entity.id)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-teal-400 hover:text-teal-300 text-xs font-medium transition"
                          title="Locate on Network Graph Canvas"
                        >
                          Graph
                        </button>
                        <button
                          onClick={() =>
                            pinToWorkspace({
                              entityId: entity.id,
                              type: 'entity',
                              title: entity.name,
                              subtitle: entity.categoryLabel,
                              column: 'active_leads',
                              notes: entity.summary,
                              tags: entity.tags,
                              confidence: 'Subject of Interest',
                            })
                          }
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-amber-400 transition"
                          title="Pin to Investigation Pinboard"
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARD VIEW */
        <div className="grid grid-cols-1 gap-3">
          {filteredEntities.map(entity => (
            <div
              key={entity.id}
              className="bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg p-4 transition-all duration-200 shadow-sm group"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                {/* Entity Icon & Identification */}
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-md bg-slate-800 border border-slate-700 shrink-0 mt-0.5">
                    {getEntityIcon(entity.type)}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-semibold text-white group-hover:text-teal-300 transition">
                        {entity.name}
                      </span>

                      <span className={`px-2 py-0.5 rounded text-[11px] font-mono border ${getBadgeStyle(entity.type)}`}>
                        {entity.categoryLabel}
                      </span>

                      <span className="text-xs font-mono text-slate-400 px-2 py-0.5 bg-slate-950 rounded border border-slate-800">
                        {entity.primaryIdentifier}
                      </span>
                    </div>

                    {entity.aliases && entity.aliases.length > 0 && (
                      <div className="text-xs text-slate-400 flex items-center gap-1.5">
                        <span className="text-slate-500">Aliases / Mapped Identifiers:</span>
                        <span className="text-slate-300 font-mono">
                          {entity.aliases.join(', ')}
                        </span>
                      </div>
                    )}

                    <p className="text-xs text-slate-300 leading-relaxed pt-0.5">
                      {entity.summary}
                    </p>

                    {/* Risk Indicator if present */}
                    {entity.riskIndicator && (
                      <div className="text-[11px] text-amber-400/90 flex items-center gap-1 font-mono pt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        <span>Intelligence Flag: {entity.riskIndicator}</span>
                      </div>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1.5">
                      {entity.tags.map(t => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 border border-slate-800 text-slate-400"
                        >
                          #{t}
                        </span>
                      ))}
                      <span className="text-[10px] font-mono text-slate-500 self-center ml-1">
                        Sighted: {entity.lastSighted}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions Toolbar */}
                <div className="flex sm:flex-col items-center sm:items-end justify-end gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                  <button
                    onClick={() => viewEntityProfile(entity.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-teal-950/70 hover:bg-teal-900/80 border border-teal-600/60 text-xs font-medium text-teal-300 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    View Profile
                  </button>

                  <button
                    onClick={() => handleInspectOnGraph(entity.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-300 hover:text-white transition"
                  >
                    <Share2 className="w-3.5 h-3.5 text-teal-400" />
                    View on Graph
                  </button>

                  <button
                    onClick={() =>
                      pinToWorkspace({
                        entityId: entity.id,
                        type: 'entity',
                        title: entity.name,
                        subtitle: entity.categoryLabel,
                        column: 'active_leads',
                        notes: entity.summary,
                        tags: entity.tags,
                        confidence: 'Subject of Interest',
                      })
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-amber-400/90 hover:text-amber-300 transition"
                    title="Pin to Investigation Pinboard"
                  >
                    <Pin className="w-3.5 h-3.5" />
                    Pin to Case
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
