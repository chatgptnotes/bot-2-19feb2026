'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Search, RefreshCw, MessageSquare, Clock } from 'lucide-react';

interface Conversation {
  id: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  status: string;
}

interface TranscriptEntry {
  id: string;
  conversation_id: string;
  speaker: string;
  text: string;
  created_at: string;
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '--';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

const SPEAKER_COLORS = [
  'bg-blue-100 text-blue-800',
  'bg-green-100 text-green-800',
  'bg-purple-100 text-purple-800',
  'bg-orange-100 text-orange-800',
  'bg-pink-100 text-pink-800',
  'bg-teal-100 text-teal-800',
];

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [entries, setEntries] = useState<TranscriptEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'active' | 'ended'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const entriesEndRef = useRef<HTMLDivElement>(null);
  const speakerColorMap = useRef<Record<string, string>>({});

  const getSpeakerColor = (speaker: string) => {
    if (!speakerColorMap.current[speaker]) {
      const index = Object.keys(speakerColorMap.current).length % SPEAKER_COLORS.length;
      speakerColorMap.current[speaker] = SPEAKER_COLORS[index];
    }
    return speakerColorMap.current[speaker];
  };

  const fetchConversations = useCallback(async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/conversations');
      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchEntries = useCallback(async (conversationId: string) => {
    try {
      setLoadingEntries(true);
      const response = await fetch(`/api/conversations?id=${conversationId}`);
      const data = await response.json();
      setEntries(data.entries || []);
    } catch (error) {
      console.error('Failed to fetch entries:', error);
    } finally {
      setLoadingEntries(false);
    }
  }, []);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    speakerColorMap.current = {};
    fetchEntries(id);
  };

  // Initial load + polling conversations list every 15s
  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 15000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  // Poll transcript entries every 10s for active conversations
  useEffect(() => {
    if (!selectedId) return;
    const selected = conversations.find(c => c.id === selectedId);
    if (selected?.status !== 'active') return;

    const interval = setInterval(() => fetchEntries(selectedId), 10000);
    return () => clearInterval(interval);
  }, [selectedId, conversations, fetchEntries]);

  // Auto-scroll to bottom on new entries
  useEffect(() => {
    entriesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries]);

  const filteredConversations = conversations.filter((c) => {
    const matchesSearch = c.id.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterMode === 'active') return matchesSearch && c.status === 'active';
    if (filterMode === 'ended') return matchesSearch && c.status !== 'active';
    return matchesSearch;
  });

  const selectedConversation = conversations.find(c => c.id === selectedId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading conversations...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Conversations</h1>
          <p className="mt-2 text-gray-600">
            View and monitor live and past conversations
            {refreshing && <span className="ml-2 text-blue-500 text-sm">(refreshing...)</span>}
          </p>
        </div>
        <button
          onClick={fetchConversations}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50 transition"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'ended'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                filterMode === mode
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Two-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Conversations list */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-3 bg-gray-50 border-b text-sm font-medium text-gray-500">
            {filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''}
          </div>
          <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                {searchQuery ? 'No conversations match your search' : 'No conversations yet'}
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => handleSelect(conv.id)}
                  className={`px-6 py-4 cursor-pointer transition ${
                    selectedId === conv.id
                      ? 'bg-blue-50 border-l-4 border-l-blue-500'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {conv.id.slice(0, 8)}...
                    </span>
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                      conv.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {conv.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(conv.started_at).toLocaleString()}
                    </span>
                    <span>{formatDuration(conv.duration_seconds)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Transcript chat view */}
        <div className="bg-white rounded-lg shadow overflow-hidden flex flex-col max-h-[600px]">
          {selectedConversation ? (
            <>
              <div className="px-6 py-3 bg-gray-50 border-b flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-900">
                    Conversation {selectedConversation.id.slice(0, 8)}...
                  </span>
                  <span className={`ml-2 inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                    selectedConversation.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedConversation.status}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {formatDuration(selectedConversation.duration_seconds)}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loadingEntries ? (
                  <div className="text-center py-8 text-gray-500">Loading transcript...</div>
                ) : entries.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No messages yet</div>
                ) : (
                  entries.map((entry) => (
                    <div key={entry.id} className="flex gap-3">
                      <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold ${getSpeakerColor(entry.speaker)}`}>
                        {entry.speaker.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-semibold text-gray-900">{entry.speaker}</span>
                          <span className="text-xs text-gray-400">
                            {new Date(entry.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mt-0.5">{entry.text}</p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={entriesEndRef} />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-16 text-gray-400">
              <MessageSquare className="h-16 w-16 mb-4" />
              <p className="text-lg">Select a conversation to view transcript</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
