import React, { useState } from 'react';
import {
  MapPin,
  AlertTriangle,
  Clock3,
  ShieldAlert,
  Lightbulb,
  Navigation,
  TrendingUp,
  Activity,
  Link2,
  Eye,
  Camera,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

/* =========================================================
   LOCATION INTELLIGENCE VIEW
   Uses existing SETU investigation data only.
   ========================================================= */

const parseCoordinates = (value: string) => {
  const match = value.match(
    /Geo:\s*([0-9.]+)°\s*N,\s*([0-9.]+)°\s*E/i
  );

  if (!match) {
    return null;
  }

  return {
    lat: Number(match[1]),
    lon: Number(match[2]),
  };
};

const parseInvestigationDate = (value: string) => {
  const normalized = value
    .replace(' IST', '')
    .replace(' ', 'T');

  return Date.parse(normalized);
};

const getRiskClasses = (riskLevel?: string) => {
  switch (riskLevel) {
    case 'HIGH':
      return {
        text: 'text-red-300',
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        dot: 'bg-red-400',
        glow: 'shadow-red-500/40',
      };

    case 'MEDIUM':
      return {
        text: 'text-orange-300',
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/30',
        dot: 'bg-orange-400',
        glow: 'shadow-orange-500/40',
      };

    default:
      return {
        text: 'text-yellow-300',
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/30',
        dot: 'bg-yellow-400',
        glow: 'shadow-yellow-500/30',
      };
  }
};

export const LocationIntelligenceView: React.FC = () => {
  const {
    entities,
    edges,
    aiInsights,
  } = useApp();

  /* =========================================================
     VIEW AREA STATE
     ========================================================= */

  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [selectedLocationEdges, setSelectedLocationEdges] = useState<any[]>([]);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');

  /* =========================================================
     LOCATION DATA
     ========================================================= */

  const locations = entities.filter(
    (entity) => entity.type === 'location'
  );

  const locationIds = new Set(
    locations.map((location) => location.id)
  );

  const spatialLinks = edges.filter(
    (edge) =>
      edge.connectionType === 'spatial' &&
      (locationIds.has(edge.source) || locationIds.has(edge.target))
  );

  const locationInsights = aiInsights.filter(
    (insight) => insight.type === 'LOCATION'
  );

  /* =========================================================
     LOCATION HELPERS
     ========================================================= */

  const getLocationLinks = (locationId: string) => {
    return spatialLinks.filter(
      (edge) =>
        edge.source === locationId ||
        edge.target === locationId
    );
  };

  const getLocationInsights = (locationId: string) => {
    return locationInsights.filter(
      (insight) =>
        insight.entityId === locationId ||
        insight.relatedEntityIds.includes(locationId)
    );
  };

  const getCoordinates = (location: typeof locations[number]) => {
    return parseCoordinates(location.primaryIdentifier);
  };

  /* =========================================================
     VIEW AREA
     Existing backend endpoints:
     GET /api/v1/entities/{entity_id}
     GET /api/v1/entities/{entity_id}/edges
     ========================================================= */

  const handleViewArea = async () => {
    if (locations.length === 0) {
      setLocationError('No location entity is available.');
      return;
    }

    const location = locations[0];

    try {
      setLoadingLocation(true);
      setLocationError('');

      const response = await fetch(
        `/api/v1/entities/${location.id}`
      );

      if (!response.ok) {
        throw new Error(
          `Unable to load location details (${response.status})`
        );
      }

      const locationData = await response.json();

      const edgesResponse = await fetch(
        `/api/v1/entities/${location.id}/edges`
      );

      let edgeData: any[] = [];

      if (edgesResponse.ok) {
        edgeData = await edgesResponse.json();
      }

      setSelectedLocation(locationData);
      setSelectedLocationEdges(edgeData);
    } catch (error) {
      console.error(
        'Location Intelligence API error:',
        error
      );

      setLocationError(
        'Location details could not be loaded from the intelligence backend.'
      );
    } finally {
      setLoadingLocation(false);
    }
  };

  /* =========================================================
     SUMMARY
     ========================================================= */

  const highRiskLocations = locations.filter(
    (location) => location.riskLevel === 'HIGH'
  );

  const mediumRiskLocations = locations.filter(
    (location) => location.riskLevel === 'MEDIUM'
  );

  const averageRisk =
    locations.length > 0
      ? Math.round(
          locations.reduce(
            (sum, location) =>
              sum + (location.riskScore ?? 0),
            0
          ) / locations.length
        )
      : 0;

  const latestLocation =
    [...locations].sort(
      (a, b) =>
        parseInvestigationDate(b.lastSighted) -
        parseInvestigationDate(a.lastSighted)
    )[0];

  /* =========================================================
     MAP NORMALIZATION
     ========================================================= */

  const coordinateLocations = locations
    .map((location) => ({
      location,
      coordinates: getCoordinates(location),
    }))
    .filter(
      (
        item
      ): item is {
        location: typeof locations[number];
        coordinates: { lat: number; lon: number };
      } => item.coordinates !== null
    );

  const latitudes = coordinateLocations.map(
    (item) => item.coordinates.lat
  );

  const longitudes = coordinateLocations.map(
    (item) => item.coordinates.lon
  );

  const minLat =
    latitudes.length > 0 ? Math.min(...latitudes) : 0;
  const maxLat =
    latitudes.length > 0 ? Math.max(...latitudes) : 1;
  const minLon =
    longitudes.length > 0 ? Math.min(...longitudes) : 0;
  const maxLon =
    longitudes.length > 0 ? Math.max(...longitudes) : 1;

  const getMapPosition = (
    coordinates: { lat: number; lon: number }
  ) => {
    const lonRange = maxLon - minLon || 1;
    const latRange = maxLat - minLat || 1;

    const left =
      10 +
      ((coordinates.lon - minLon) / lonRange) * 80;

    const top =
      10 +
      (1 -
        (coordinates.lat - minLat) / latRange) *
        80;

    return {
      left: `${Math.min(88, Math.max(8, left))}%`,
      top: `${Math.min(88, Math.max(8, top))}%`,
    };
  };

  /* =========================================================
     PREVENTIVE RECOMMENDATIONS
     Derived from existing location metadata/tags/summary.
     ========================================================= */

  const recommendations: {
    title: string;
    description: string;
    type: 'lighting' | 'camera' | 'surveillance' | 'coverage';
  }[] = [];

  locations.forEach((location) => {
    const searchableText = [
      location.name,
      location.categoryLabel,
      location.summary,
      ...location.tags,
      ...Object.keys(location.metadata),
      ...Object.values(location.metadata).map(String),
    ]
      .join(' ')
      .toLowerCase();

    if (
      searchableText.includes('unlit') ||
      searchableText.includes('lighting')
    ) {
      recommendations.push({
        title: 'Lighting & visibility review',
        description: `Review lighting coverage around ${location.name} based on the existing location record.`,
        type: 'lighting',
      });
    }

    if (
      searchableText.includes('cctv') ||
      searchableText.includes('camera')
    ) {
      recommendations.push({
        title: 'CCTV coverage review',
        description: `Review available CCTV coverage around ${location.name} and identify any observation gaps.`,
        type: 'camera',
      });
    }

    if (
      searchableText.includes('anpr') ||
      searchableText.includes('fastag')
    ) {
      recommendations.push({
        title: 'Checkpoint monitoring review',
        description: `Review ANPR / checkpoint evidence coverage around ${location.name}.`,
        type: 'coverage',
      });
    }

    if (
      searchableText.includes('cash settlement') ||
      searchableText.includes('physical surveillance')
    ) {
      recommendations.push({
        title: 'Surveillance review',
        description: `Review surveillance evidence associated with ${location.name}.`,
        type: 'surveillance',
      });
    }
  });

  const uniqueRecommendations = recommendations.filter(
    (recommendation, index, array) =>
      index ===
      array.findIndex(
        (item) =>
          item.title === recommendation.title
      )
  );

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <div className="min-h-full bg-[#0B0F17] text-slate-100 p-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-6">

        <div className="flex items-start justify-between gap-4">

          <div>

            <div className="flex items-center gap-2 mb-2">

              <div className="p-2 rounded-lg bg-blue-500/15 border border-blue-400/30">
                <MapPin className="w-5 h-5 text-blue-300" />
              </div>

              <span className="text-xs uppercase tracking-[0.18em] text-slate-400">
                SETU / Intelligence
              </span>

            </div>

            <h1 className="text-2xl font-semibold text-white">
              Location Intelligence
            </h1>

            <p className="mt-1 text-sm text-slate-300">
              Geographic analysis of investigation locations,
              spatial relationships and location-based patterns.
            </p>

          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-emerald-400/30 bg-emerald-500/10">

            <span className="w-2 h-2 rounded-full bg-emerald-300" />

            <span className="text-xs text-emerald-300">
              Intelligence Layer Active
            </span>

          </div>

        </div>

      </div>

      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">

        {/* MAPPED LOCATIONS */}

        <div className="rounded-xl border border-white/15 bg-[#111722] p-4 shadow-lg shadow-black/10">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-xs text-slate-400 uppercase tracking-wider">
                Mapped Locations
              </p>

              <p className="text-2xl font-semibold text-white mt-2">
                {locations.length}
              </p>

            </div>

            <div className="p-2 rounded-lg bg-blue-500/15">
              <MapPin className="w-5 h-5 text-blue-300" />
            </div>

          </div>

          <div className="flex items-center gap-1 mt-3 text-xs text-slate-400">
            <Activity className="w-3.5 h-3.5" />
            Investigation location entities
          </div>

        </div>

        {/* SPATIAL LINKS */}

        <div className="rounded-xl border border-white/15 bg-[#111722] p-4 shadow-lg shadow-black/10">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-xs text-slate-400 uppercase tracking-wider">
                Spatial Links
              </p>

              <p className="text-2xl font-semibold text-white mt-2">
                {spatialLinks.length}
              </p>

            </div>

            <div className="p-2 rounded-lg bg-purple-500/15">
              <Link2 className="w-5 h-5 text-purple-300" />
            </div>

          </div>

          <div className="mt-3 text-xs text-slate-400">
            Location-linked relationships
          </div>

        </div>

        {/* HIGH RISK */}

        <div className="rounded-xl border border-white/15 bg-[#111722] p-4 shadow-lg shadow-black/10">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-xs text-slate-400 uppercase tracking-wider">
                High Risk Locations
              </p>

              <p className="text-2xl font-semibold text-white mt-2">
                {highRiskLocations.length}
              </p>

            </div>

            <div className="p-2 rounded-lg bg-red-500/15">
              <ShieldAlert className="w-5 h-5 text-red-300" />
            </div>

          </div>

          <div className="mt-3 text-xs text-slate-400">
            Based on existing risk scores
          </div>

        </div>

        {/* LOCATION INSIGHTS */}

        <div className="rounded-xl border border-white/15 bg-[#111722] p-4 shadow-lg shadow-black/10">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-xs text-slate-400 uppercase tracking-wider">
                Location Insights
              </p>

              <p className="text-2xl font-semibold text-white mt-2">
                {locationInsights.length}
              </p>

            </div>

            <div className="p-2 rounded-lg bg-orange-500/15">
              <TrendingUp className="w-5 h-5 text-orange-300" />
            </div>

          </div>

          <div className="mt-3 text-xs text-slate-400">
            AI-generated spatial observations
          </div>

        </div>

      </div>

      {/* =================================================
          MAP + LOCATION SUMMARY
      ================================================= */}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">

        {/* MAP */}

        <div className="xl:col-span-2 rounded-xl border border-white/15 bg-[#111722] overflow-hidden shadow-lg shadow-black/10">

          <div className="px-5 py-4 border-b border-white/15 flex items-center justify-between">

            <div>

              <h2 className="text-sm font-semibold text-white">
                Geographic Activity Map
              </h2>

              <p className="text-xs text-slate-400 mt-1">
                Location entities plotted from existing geographic coordinates
              </p>

            </div>

            <button
              onClick={handleViewArea}
              disabled={loadingLocation}
              className="
                flex items-center gap-2
                px-3 py-2
                rounded-lg
                border border-white/15
                bg-white/[0.06]
                text-xs text-slate-200
                hover:bg-white/[0.10]
                hover:border-white/25
                transition
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >
              <Navigation className="w-3.5 h-3.5" />

              {loadingLocation
                ? 'Loading Area...'
                : 'View Area'}
            </button>

          </div>

          <div className="relative h-[420px] bg-[#0D141F] overflow-hidden">

            {/* GRID */}

            <div
              className="
                absolute inset-0
                opacity-30
                bg-[linear-gradient(rgba(148,163,184,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.14)_1px,transparent_1px)]
                bg-[size:42px_42px]
              "
            />

            {/* MAP LINES */}

            <div className="absolute left-[8%] top-[35%] w-[85%] h-px bg-slate-500/50 rotate-[8deg]" />
            <div className="absolute left-[15%] top-[65%] w-[75%] h-px bg-slate-500/50 -rotate-[12deg]" />
            <div className="absolute left-[48%] top-[5%] w-px h-[90%] bg-slate-500/50 rotate-[10deg]" />
            <div className="absolute left-[70%] top-[10%] w-px h-[85%] bg-slate-500/40 -rotate-[20deg]" />

            {/* LOCATION POINTS */}

            {coordinateLocations.map(
              ({ location, coordinates }) => {

                const position =
                  getMapPosition(coordinates);

                const riskClasses =
                  getRiskClasses(
                    location.riskLevel
                  );

                const links =
                  getLocationLinks(location.id);

                return (
                  <div
                    key={location.id}
                    className="absolute"
                    style={{
                      left: position.left,
                      top: position.top,
                    }}
                  >

                    <div
                      className={`absolute -inset-7 rounded-full ${riskClasses.bg} animate-pulse`}
                    />

                    <div
                      className={`absolute -inset-4 rounded-full ${riskClasses.bg}`}
                    />

                    <div
                      className={`
                        relative
                        w-4 h-4
                        rounded-full
                        ${riskClasses.dot}
                        border-2 border-white
                        shadow-lg
                        ${riskClasses.glow}
                      `}
                    />

                    <div className="absolute left-6 top-[-4px] whitespace-nowrap">

                      <span
                        className={`
                          text-[10px]
                          font-medium
                          ${riskClasses.text}
                          bg-[#080C12]/95
                          px-2 py-1
                          rounded
                          border
                          ${riskClasses.border}
                          shadow-lg
                        `}
                      >
                        {location.name}
                        {' · '}
                        {links.length} links
                      </span>

                    </div>

                  </div>
                );
              }
            )}

            {/* MAP LEGEND */}

            <div className="absolute bottom-4 left-4">

              <div className="flex items-center gap-4 px-3 py-2 rounded-lg bg-[#080C12]/95 border border-white/15 shadow-lg">

                <div className="flex items-center gap-2">

                  <span className="w-2.5 h-2.5 rounded-full bg-red-400" />

                  <span className="text-[10px] text-slate-300">
                    High
                  </span>

                </div>

                <div className="flex items-center gap-2">

                  <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />

                  <span className="text-[10px] text-slate-300">
                    Medium
                  </span>

                </div>

                <div className="flex items-center gap-2">

                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />

                  <span className="text-[10px] text-slate-300">
                    Low
                  </span>

                </div>

              </div>

            </div>

            {/* EMPTY STATE */}

            {coordinateLocations.length === 0 && (

              <div className="absolute inset-0 flex items-center justify-center">

                <div className="text-center">

                  <MapPin className="w-8 h-8 text-slate-500 mx-auto mb-2" />

                  <p className="text-sm text-slate-300">
                    No geographic coordinates available
                  </p>

                </div>

              </div>

            )}

          </div>

        </div>

        {/* LOCATION SUMMARY */}

        <div className="rounded-xl border border-white/15 bg-[#111722] shadow-lg shadow-black/10">

          <div className="px-5 py-4 border-b border-white/15">

            <h2 className="text-sm font-semibold text-white">
              Location Summary
            </h2>

            <p className="text-xs text-slate-400 mt-1">
              Existing investigation locations
            </p>

          </div>

          <div className="p-4 space-y-3">

            {locations.map(
              (location, index) => {

                const riskClasses =
                  getRiskClasses(
                    location.riskLevel
                  );

                const links =
                  getLocationLinks(location.id);

                const insights =
                  getLocationInsights(
                    location.id
                  );

                return (
                  <div
                    key={location.id}
                    className="
                      rounded-lg
                      border border-white/15
                      bg-white/[0.035]
                      p-3
                    "
                  >

                    <div className="flex items-start justify-between gap-3">

                      <div className="flex items-start gap-3">

                        <div className="mt-0.5 text-slate-400 text-xs">
                          {String(index + 1).padStart(2, '0')}
                        </div>

                        <div>

                          <p className="text-sm font-medium text-slate-100">
                            {location.name}
                          </p>

                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {location.categoryLabel}
                          </p>

                        </div>

                      </div>

                      <span
                        className={`
                          px-2 py-1
                          rounded
                          text-[10px]
                          border
                          ${riskClasses.text}
                          ${riskClasses.bg}
                          ${riskClasses.border}
                        `}
                      >
                        {location.riskLevel ?? 'LOW'}
                      </span>

                    </div>

                    <div className="flex items-center justify-between mt-3">

                      <div className="flex items-center gap-2">

                        <span className="text-lg font-semibold text-white">
                          {location.riskScore ?? 0}
                        </span>

                        <span className="text-[10px] text-slate-400">
                          risk score
                        </span>

                      </div>

                      <span className="text-[10px] text-slate-300">
                        {links.length} spatial links
                      </span>

                    </div>

                    <div className="mt-2 flex items-center justify-between">

                      <div className="flex items-center gap-1 text-[10px] text-slate-400">

                        <Eye className="w-3 h-3" />

                        {insights.length} AI insight
                        {insights.length !== 1 ? 's' : ''}

                      </div>

                      <span className="text-[10px] text-slate-400">
                        {location.jurisdiction}
                      </span>

                    </div>

                  </div>
                );
              }
            )}

          </div>

        </div>

      </div>

      {/* =================================================
          LOCATION CONCENTRATION + TIME WINDOWS
      ================================================= */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* SPATIAL CONCENTRATION */}

        <div className="rounded-xl border border-white/15 bg-[#111722] shadow-lg shadow-black/10">

          <div className="px-5 py-4 border-b border-white/15">

            <div className="flex items-center gap-2">

              <TrendingUp className="w-4 h-4 text-blue-300" />

              <h2 className="text-sm font-semibold text-white">
                Spatial Evidence Concentration
              </h2>

            </div>

            <p className="text-xs text-slate-400 mt-1">
              Location-linked evidence relationships
            </p>

          </div>

          <div className="p-5 space-y-4">

            {locations
              .map((location) => ({
                location,
                count: getLocationLinks(
                  location.id
                ).length,
              }))
              .sort((a, b) => b.count - a.count)
              .map(
                ({ location, count }) => {

                  const maxCount =
                    Math.max(
                      ...locations.map(
                        (item) =>
                          getLocationLinks(
                            item.id
                          ).length
                      ),
                      1
                    );

                  const width =
                    (count / maxCount) * 100;

                  return (
                    <div key={location.id}>

                      <div className="flex justify-between mb-2">

                        <span className="text-xs text-slate-300">
                          {location.name}
                        </span>

                        <span className="text-xs text-slate-400">
                          {count} link
                          {count !== 1 ? 's' : ''}
                        </span>

                      </div>

                      <div className="h-2 rounded-full bg-slate-700/80 overflow-hidden">

                        <div
                          className="h-full rounded-full bg-slate-400"
                          style={{
                            width: `${width}%`,
                          }}
                        />

                      </div>

                    </div>
                  );
                }
              )}

          </div>

        </div>

        {/* TIME ANALYSIS */}

        <div className="rounded-xl border border-white/15 bg-[#111722] shadow-lg shadow-black/10">

          <div className="px-5 py-4 border-b border-white/15">

            <div className="flex items-center gap-2">

              <Clock3 className="w-4 h-4 text-purple-300" />

              <h2 className="text-sm font-semibold text-white">
                Time & Location Analysis
              </h2>

            </div>

            <p className="text-xs text-slate-400 mt-1">
              Recorded sighting windows for mapped locations
            </p>

          </div>

          <div className="p-5 space-y-3">

            {locations
              .slice()
              .sort(
                (a, b) =>
                  parseInvestigationDate(
                    b.lastSighted
                  ) -
                  parseInvestigationDate(
                    a.lastSighted
                  )
              )
              .map((location) => (

                <div
                  key={location.id}
                  className="
                    rounded-lg
                    border border-white/15
                    bg-white/[0.035]
                    p-3
                  "
                >

                  <div className="flex items-start justify-between gap-3">

                    <div>

                      <p className="text-xs font-medium text-slate-100">
                        {location.name}
                      </p>

                      <p className="text-[10px] text-slate-400 mt-1">
                        {location.firstSighted}
                      </p>

                    </div>

                    <Clock3 className="w-3.5 h-3.5 text-purple-300 shrink-0" />

                  </div>

                  <div className="mt-2 text-[10px] text-slate-400">

                    Last sighting:{' '}

                    <span className="text-slate-300">
                      {location.lastSighted}
                    </span>

                  </div>

                </div>

              ))}

            {latestLocation && (

              <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-400">

                <Activity className="w-3 h-3" />

                Latest recorded location sighting:{' '}

                <span className="text-slate-300">
                  {latestLocation.name}
                </span>

              </div>

            )}

          </div>

        </div>

      </div>

      {/* =================================================
          LOCATION RISK / DATA QUALITY
      ================================================= */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* RISK DISTRIBUTION */}

        <div className="rounded-xl border border-white/15 bg-[#111722] shadow-lg shadow-black/10">

          <div className="px-5 py-4 border-b border-white/15">

            <div className="flex items-center gap-2">

              <ShieldAlert className="w-4 h-4 text-red-300" />

              <h2 className="text-sm font-semibold text-white">
                Location Risk Distribution
              </h2>

            </div>

            <p className="text-xs text-slate-400 mt-1">
              Existing location risk classification
            </p>

          </div>

          <div className="p-5 space-y-4">

            <div>

              <div className="flex items-center justify-between mb-2">

                <span className="text-xs text-slate-300">
                  High Risk
                </span>

                <span className="text-xs text-red-300">
                  {highRiskLocations.length}
                </span>

              </div>

              <div className="h-2 rounded-full bg-slate-700/80 overflow-hidden">

                <div
                  className="h-full rounded-full bg-red-400"
                  style={{
                    width: `${
                      locations.length
                        ? (highRiskLocations.length /
                            locations.length) *
                          100
                        : 0
                    }%`,
                  }}
                />

              </div>

            </div>

            <div>

              <div className="flex items-center justify-between mb-2">

                <span className="text-xs text-slate-300">
                  Medium Risk
                </span>

                <span className="text-xs text-orange-300">
                  {mediumRiskLocations.length}
                </span>

              </div>

              <div className="h-2 rounded-full bg-slate-700/80 overflow-hidden">

                <div
                  className="h-full rounded-full bg-orange-400"
                  style={{
                    width: `${
                      locations.length
                        ? (mediumRiskLocations.length /
                            locations.length) *
                          100
                        : 0
                    }%`,
                  }}
                />

              </div>

            </div>

            <div className="pt-2 border-t border-white/15 flex items-center justify-between">

              <span className="text-xs text-slate-400">
                Average location risk score
              </span>

              <span className="text-sm font-semibold text-white">
                {averageRisk}
              </span>

            </div>

          </div>

        </div>

        {/* EVIDENCE SOURCES */}

        <div className="rounded-xl border border-white/15 bg-[#111722] shadow-lg shadow-black/10">

          <div className="px-5 py-4 border-b border-white/15">

            <div className="flex items-center gap-2">

              <Camera className="w-4 h-4 text-blue-300" />

              <h2 className="text-sm font-semibold text-white">
                Location Evidence Sources
              </h2>

            </div>

            <p className="text-xs text-slate-400 mt-1">
              Existing metadata associated with mapped locations
            </p>

          </div>

          <div className="p-5">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              {locations.map((location) => {

                const metadataKeys =
                  Object.keys(
                    location.metadata
                  );

                return (
                  <div
                    key={location.id}
                    className="
                      rounded-lg
                      border border-white/15
                      bg-white/[0.035]
                      p-3
                    "
                  >

                    <p className="text-xs font-medium text-slate-100">
                      {location.name}
                    </p>

                    <div className="mt-2 space-y-1">

                      {metadataKeys.map(
                        (key) => (
                          <div
                            key={key}
                            className="text-[10px] text-slate-400"
                          >
                            <span className="text-slate-300">
                              {key}:
                            </span>{' '}
                            {String(
                              location.metadata[key]
                            )}
                          </div>
                        )
                      )}

                    </div>

                  </div>
                );
              })}

            </div>

          </div>

        </div>

      </div>

      {/* =================================================
          PREVENTIVE RECOMMENDATIONS
      ================================================= */}

      <div className="rounded-xl border border-white/15 bg-[#111722] shadow-lg shadow-black/10">

        <div className="px-5 py-4 border-b border-white/15">

          <div className="flex items-center gap-2">

            <Lightbulb className="w-4 h-4 text-yellow-300" />

            <h2 className="text-sm font-semibold text-white">
              Preventive Recommendations
            </h2>

          </div>

          <p className="text-xs text-slate-400 mt-1">
            Recommendations derived from existing location evidence
          </p>

        </div>

        <div className="p-5">

          {uniqueRecommendations.length > 0 ? (

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">

              {uniqueRecommendations.map(
                (recommendation, index) => {

                  const Icon =
                    recommendation.type ===
                    'lighting'
                      ? Lightbulb
                      : recommendation.type ===
                        'camera'
                      ? Camera
                      : recommendation.type ===
                        'surveillance'
                      ? Eye
                      : Navigation;

                  const iconClass =
                    recommendation.type ===
                    'lighting'
                      ? 'text-yellow-300'
                      : recommendation.type ===
                        'camera'
                      ? 'text-blue-300'
                      : recommendation.type ===
                        'surveillance'
                      ? 'text-red-300'
                      : 'text-purple-300';

                  const borderClass =
                    recommendation.type ===
                    'lighting'
                      ? 'border-yellow-500/20 bg-yellow-500/[0.05]'
                      : recommendation.type ===
                        'camera'
                      ? 'border-blue-500/20 bg-blue-500/[0.05]'
                      : recommendation.type ===
                        'surveillance'
                      ? 'border-red-500/20 bg-red-500/[0.05]'
                      : 'border-purple-500/20 bg-purple-500/[0.05]';

                  return (
                    <div
                      key={`${recommendation.title}-${index}`}
                      className={`
                        flex gap-3
                        p-3
                        rounded-lg
                        border
                        ${borderClass}
                      `}
                    >

                      <Icon
                        className={`
                          w-4 h-4
                          mt-0.5
                          shrink-0
                          ${iconClass}
                        `}
                      />

                      <div>

                        <p className="text-xs font-medium text-slate-100">
                          {recommendation.title}
                        </p>

                        <p className="text-[11px] leading-relaxed text-slate-300 mt-1">
                          {recommendation.description}
                        </p>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          ) : (

            <div className="flex items-center gap-3 p-4 rounded-lg border border-white/15 bg-white/[0.035]">

              <Lightbulb className="w-4 h-4 text-slate-400" />

              <p className="text-xs text-slate-300">
                No location-specific preventive recommendation
                can be derived from the currently available data.
              </p>

            </div>

          )}

        </div>

      </div>

      {/* =================================================
          VIEW AREA MODAL
      ================================================= */}

      {selectedLocation && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">

          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-white/15 bg-[#111722] shadow-2xl">

            {/* MODAL HEADER */}

            <div className="px-5 py-4 border-b border-white/15 flex items-start justify-between gap-4">

              <div>

                <div className="flex items-center gap-2">

                  <MapPin className="w-4 h-4 text-blue-300" />

                  <h2 className="text-sm font-semibold text-white">
                    Area Intelligence
                  </h2>

                </div>

                <p className="text-xs text-slate-400 mt-1">
                  Backend entity profile and connected evidence
                </p>

              </div>

              <button
                onClick={() => {
                  setSelectedLocation(null);
                  setSelectedLocationEdges([]);
                  setLocationError('');
                }}
                className="
                  px-2 py-1
                  rounded
                  text-xs
                  text-slate-300
                  hover:text-white
                  hover:bg-white/10
                  transition
                "
              >
                Close
              </button>

            </div>

            {/* MODAL BODY */}

            <div className="p-5 space-y-4">

              {/* LOCATION NAME */}

              <div>

                <p className="text-lg font-semibold text-white">
                  {selectedLocation.name}
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  {selectedLocation.categoryLabel}
                </p>

              </div>

              {/* RISK */}

              <div className="grid grid-cols-2 gap-3">

                <div className="rounded-lg border border-white/15 bg-white/[0.035] p-3">

                  <p className="text-[10px] text-slate-400 uppercase">
                    Risk Level
                  </p>

                  <p className="text-sm text-white mt-1">
                    {selectedLocation.riskLevel ?? 'LOW'}
                  </p>

                </div>

                <div className="rounded-lg border border-white/15 bg-white/[0.035] p-3">

                  <p className="text-[10px] text-slate-400 uppercase">
                    Risk Score
                  </p>

                  <p className="text-sm text-white mt-1">
                    {selectedLocation.riskScore ?? 0}
                  </p>

                </div>

              </div>

              {/* LOCATION */}

              <div className="rounded-lg border border-white/15 bg-white/[0.035] p-3">

                <p className="text-[10px] text-slate-400 uppercase">
                  Location
                </p>

                <p className="text-xs text-slate-200 mt-1">
                  {selectedLocation.name}
                </p>

                <p className="text-[11px] text-slate-400 mt-1">
                  {selectedLocation.primaryIdentifier}
                </p>

              </div>

              {/* JURISDICTION */}

              <div className="rounded-lg border border-white/15 bg-white/[0.035] p-3">

                <p className="text-[10px] text-slate-400 uppercase">
                  Jurisdiction
                </p>

                <p className="text-xs text-slate-200 mt-1">
                  {selectedLocation.jurisdiction}
                </p>

              </div>

              {/* SUMMARY */}

              <div className="rounded-lg border border-white/15 bg-white/[0.035] p-3">

                <p className="text-[10px] text-slate-400 uppercase">
                  Investigation Summary
                </p>

                <p className="text-xs leading-relaxed text-slate-300 mt-2">
                  {selectedLocation.summary}
                </p>

              </div>

              {/* TIME */}

              <div className="grid grid-cols-2 gap-3">

                <div className="rounded-lg border border-white/15 bg-white/[0.035] p-3">

                  <p className="text-[10px] text-slate-400 uppercase">
                    First Sighted
                  </p>

                  <p className="text-[11px] text-slate-200 mt-1">
                    {selectedLocation.firstSighted}
                  </p>

                </div>

                <div className="rounded-lg border border-white/15 bg-white/[0.035] p-3">

                  <p className="text-[10px] text-slate-400 uppercase">
                    Last Sighted
                  </p>

                  <p className="text-[11px] text-slate-200 mt-1">
                    {selectedLocation.lastSighted}
                  </p>

                </div>

              </div>

              {/* TAGS */}

              {selectedLocation.tags &&
                selectedLocation.tags.length > 0 && (

                  <div className="rounded-lg border border-white/15 bg-white/[0.035] p-3">

                    <p className="text-[10px] text-slate-400 uppercase">
                      Investigation Tags
                    </p>

                    <div className="flex flex-wrap gap-2 mt-2">

                      {selectedLocation.tags.map(
                        (tag: string) => (

                          <span
                            key={tag}
                            className="
                              px-2 py-1
                              rounded
                              border border-white/15
                              bg-white/[0.05]
                              text-[10px]
                              text-slate-300
                            "
                          >
                            {tag}
                          </span>

                        )
                      )}

                    </div>

                  </div>

                )}

              {/* METADATA */}

              {selectedLocation.metadata &&
                Object.keys(selectedLocation.metadata).length > 0 && (

                  <div className="rounded-lg border border-white/15 bg-white/[0.035] p-3">

                    <p className="text-[10px] text-slate-400 uppercase">
                      Evidence Metadata
                    </p>

                    <div className="mt-2 space-y-2">

                      {Object.entries(
                        selectedLocation.metadata
                      ).map(
                        ([key, value]) => (

                          <div
                            key={key}
                            className="flex items-center justify-between gap-4"
                          >

                            <span className="text-[10px] text-slate-400">
                              {key}
                            </span>

                            <span className="text-[10px] text-slate-200 text-right">
                              {String(value)}
                            </span>

                          </div>

                        )
                      )}

                    </div>

                  </div>

                )}

              {/* CONNECTED EVIDENCE */}

              <div>

                <div className="flex items-center justify-between mb-2">

                  <p className="text-[10px] text-slate-400 uppercase">
                    Connected Evidence
                  </p>

                  <span className="text-[10px] text-blue-300">
                    {selectedLocationEdges.length} connections
                  </span>

                </div>

                {selectedLocationEdges.length > 0 ? (

                  <div className="space-y-2">

                    {selectedLocationEdges.map(
                      (edge: any) => (

                        <div
                          key={edge.id}
                          className="
                            rounded-lg
                            border border-white/15
                            bg-white/[0.035]
                            p-3
                          "
                        >

                          <div className="flex items-center gap-2">

                            <Link2 className="w-3.5 h-3.5 text-purple-300" />

                            <p className="text-xs text-slate-200">
                              {edge.label ??
                                edge.relationship ??
                                'Spatial relationship'}
                            </p>

                          </div>

                          <p className="text-[10px] text-slate-400 mt-1">

                            {edge.source_id ??
                              edge.source ??
                              'Unknown'}

                            {' → '}

                            {edge.target_id ??
                              edge.target ??
                              'Unknown'}

                          </p>

                        </div>

                      )
                    )}

                  </div>

                ) : (

                  <div className="rounded-lg border border-white/15 bg-white/[0.035] p-3">

                    <p className="text-xs text-slate-300">
                      No direct connected evidence was returned by the backend.
                    </p>

                  </div>

                )}

              </div>

              {/* ERROR */}

              {locationError && (

                <div className="rounded-lg border border-red-400/30 bg-red-500/10 p-3">

                  <div className="flex items-start gap-2">

                    <AlertTriangle className="w-4 h-4 text-red-300 mt-0.5" />

                    <p className="text-xs text-red-200">
                      {locationError}
                    </p>

                  </div>

                </div>

              )}

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default LocationIntelligenceView;