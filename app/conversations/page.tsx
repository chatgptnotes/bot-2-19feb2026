'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Search, RefreshCw, MessageSquare, Clock, Send, Bot, Smartphone, Loader, AlertCircle, WifiOff, Paperclip, X, Image as ImageIcon, Mail, MailCheck, ChevronDown, ChevronUp, Settings2, Globe, Languages } from 'lucide-react';

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

interface ReplyLogEntry {
  threadId: string;
  from: string;
  subject: string;
  aiReply: string;
  timestamp: string;
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
  const [chatMode, setChatMode] = useState<'ai' | 'whatsapp'>('ai');
  const [chatInput, setChatInput] = useState('');
  const [sending, setSending] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; mode: string; image?: string }>>([]);
  const [pendingImage, setPendingImage] = useState<{ base64: string; mimeType: string; preview: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatMessagesRef = useRef(chatMessages);
  chatMessagesRef.current = chatMessages;
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);
  const [autoReplyStatus, setAutoReplyStatus] = useState<string | null>(null);
  const [autoReplyTone, setAutoReplyTone] = useState<string>('professional');
  const [autoReplyCustomInstructions, setAutoReplyCustomInstructions] = useState('');
  const [replyLogEntries, setReplyLogEntries] = useState<ReplyLogEntry[]>([]);
  const [autoReplyExpanded, setAutoReplyExpanded] = useState(false);
  const [showToneSettings, setShowToneSettings] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [entriesError, setEntriesError] = useState<string | null>(null);
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);
  const entriesEndRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const speakerColorMap = useRef<Record<string, string>>({});

  const getSpeakerColor = (speaker: string) => {
    if (!speakerColorMap.current[speaker]) {
      const index = Object.keys(speakerColorMap.current).length % SPEAKER_COLORS.length;
      speakerColorMap.current[speaker] = SPEAKER_COLORS[index];
    }
    return speakerColorMap.current[speaker];
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('Image must be under 10MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1];
      setPendingImage({ base64, mimeType: file.type, preview: dataUrl });
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const fetchConversations = useCallback(async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/conversations');
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      const data = await response.json();
      setConversations(data.conversations || []);
      setError(null);
      setConsecutiveFailures(0);
    } catch (err: any) {
      setConsecutiveFailures(prev => {
        const next = prev + 1;
        if (next >= 2) {
          setError('Unable to reach server. Will retry automatically.');
        }
        return next;
      });
      console.error('Failed to fetch conversations:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchEntries = useCallback(async (conversationId: string) => {
    try {
      setLoadingEntries(true);
      setEntriesError(null);
      const response = await fetch(`/api/conversations?id=${conversationId}`);
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      const data = await response.json();
      setEntries(data.entries || []);
    } catch (err: any) {
      console.error('Failed to fetch entries:', err);
      setEntriesError('Failed to load transcript.');
    } finally {
      setLoadingEntries(false);
    }
  }, []);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    speakerColorMap.current = {};
    fetchEntries(id);
  };

  const sendMessage = async () => {
    if ((!chatInput.trim() && !pendingImage) || sending) return;
    const msg = chatInput.trim();
    const imageToSend = pendingImage;
    setChatInput('');
    setPendingImage(null);
    setChatMessages(prev => [...prev, { role: 'user', text: msg || '(image)', mode: chatMode, image: imageToSend?.preview }]);
    setSending(true);
    try {
      const payload: any = { message: msg, mode: chatMode };
      if (imageToSend) {
        payload.image = imageToSend.base64;
        payload.imageMimeType = imageToSend.mimeType;
      }
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        let errorMsg = `Server error (${res.status})`;
        try {
          const parsed = await res.json();
          errorMsg = parsed.error || parsed.details || errorMsg;
        } catch {}
        setChatMessages(prev => [...prev, { role: 'assistant', text: `Error: ${errorMsg}`, mode: chatMode }]);
        return;
      }
      const data = await res.json();
      if (data.success) {
        setChatMessages(prev => [...prev, { role: 'assistant', text: data.reply, mode: chatMode }]);
      } else {
        setChatMessages(prev => [...prev, { role: 'assistant', text: `Error: ${data.error}`, mode: chatMode }]);
      }
    } catch (err: any) {
      setChatMessages(prev => [...prev, { role: 'assistant', text: `Error: ${err.message}`, mode: chatMode }]);
    } finally {
      setSending(false);
    }
  };

  // Toggle auto-reply
  const toggleAutoReply = async () => {
    const newState = !autoReplyEnabled;
    try {
      const res = await fetch('/api/gmail/auto-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: newState,
          tone: autoReplyTone,
          customInstructions: autoReplyCustomInstructions,
        }),
      });
      if (res.ok) {
        setAutoReplyEnabled(newState);
        setAutoReplyStatus(newState ? 'Watching for "test" emails...' : null);
        if (!newState) setReplyLogEntries([]);
      }
    } catch (err) {
      console.error('Failed to toggle auto-reply:', err);
    }
  };

  // Save tone config without toggling
  const saveToneConfig = async () => {
    try {
      const res = await fetch('/api/gmail/auto-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tone: autoReplyTone,
          customInstructions: autoReplyCustomInstructions,
        }),
      });
      if (res.ok) {
        setShowToneSettings(false);
      }
    } catch (err) {
      console.error('Failed to save tone config:', err);
    }
  };

  // Poll auto-reply when enabled
  useEffect(() => {
    if (!autoReplyEnabled) return;
    const checkAutoReply = async () => {
      try {
        const res = await fetch('/api/gmail/auto-reply');
        if (res.ok) {
          const data = await res.json();
          if (data.replyLog) {
            setReplyLogEntries(data.replyLog);
          }
          if (data.replied > 0) {
            setAutoReplyStatus(`Replied to ${data.replied} email(s)!`);
            setTimeout(() => setAutoReplyStatus('Watching for "test" emails...'), 5000);
          }
        }
      } catch {}
    };
    checkAutoReply();
    const timer = setInterval(checkAutoReply, 30000);
    return () => clearInterval(timer);
  }, [autoReplyEnabled]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Initial load + adaptive polling (slows down on failures)
  useEffect(() => {
    fetchConversations();
    const interval = consecutiveFailures >= 5
      ? 60000
      : consecutiveFailures >= 2
        ? 30000
        : 15000;
    const timer = setInterval(fetchConversations, interval);
    return () => clearInterval(timer);
  }, [fetchConversations, consecutiveFailures]);

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

      {/* Connection error banner */}
      {error && (
        <div className="mb-4 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <WifiOff className="h-5 w-5 flex-shrink-0" />
          <span className="flex-1">{error}</span>
          <button
            onClick={() => { setError(null); setConsecutiveFailures(0); fetchConversations(); }}
            className="rounded bg-amber-200 px-3 py-1 text-xs font-medium hover:bg-amber-300 transition-colors"
          >
            Retry Now
          </button>
        </div>
      )}

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

        {/* Right: Transcript + Chat */}
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
                ) : entriesError ? (
                  <div className="text-center py-8 text-red-500">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">{entriesError}</p>
                    <button
                      onClick={() => selectedId && fetchEntries(selectedId)}
                      className="mt-2 rounded bg-red-100 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-200 transition-colors"
                    >
                      Retry
                    </button>
                  </div>
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

              {/* Chat Input Bar */}
              <div className="border-t bg-gray-50 p-3">
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() => setChatMode('ai')}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      chatMode === 'ai'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    <Bot className="h-3 w-3" /> AI
                  </button>
                  <button
                    onClick={() => setChatMode('whatsapp')}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      chatMode === 'whatsapp'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    <Smartphone className="h-3 w-3" /> WhatsApp
                  </button>
                </div>
                {pendingImage && (
                  <div className="mb-2 relative inline-block">
                    <img src={pendingImage.preview} alt="Preview" className="max-h-24 rounded border" />
                    <button
                      onClick={() => setPendingImage(null)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                <div className="flex gap-2">
                  {chatMode === 'ai' && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={sending}
                      className="px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                      title="Attach image"
                    >
                      <Paperclip className="h-4 w-4" />
                    </button>
                  )}
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    placeholder={chatMode === 'ai' ? 'Ask AI anything...' : 'Send WhatsApp message...'}
                    disabled={sending}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={sending || (!chatInput.trim() && !pendingImage)}
                    className={`px-3 py-2 rounded-lg text-white transition-colors disabled:opacity-50 ${
                      chatMode === 'ai'
                        ? 'bg-purple-600 hover:bg-purple-700'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {sending ? <Loader className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Chat panel when no conversation selected */}
              <div className="px-6 py-3 bg-gray-50 border-b">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">Chat</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setChatMode('ai')}
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        chatMode === 'ai'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      <Bot className="h-3 w-3" /> AI
                    </button>
                    <button
                      onClick={() => setChatMode('whatsapp')}
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        chatMode === 'whatsapp'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      <Smartphone className="h-3 w-3" /> WhatsApp
                    </button>
                  </div>
                </div>
                {/* Auto-Reply Section */}
                <div className="mt-2 pt-2 border-t border-gray-200">
                  {/* Top row: icon, status, settings gear, toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {autoReplyEnabled ? (
                        <MailCheck className="h-4 w-4 text-green-600" />
                      ) : (
                        <Mail className="h-4 w-4 text-gray-400" />
                      )}
                      <span className="text-xs text-gray-600">
                        {autoReplyStatus || 'Gmail Auto-Reply'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowToneSettings(!showToneSettings)}
                        className="p-1 rounded hover:bg-gray-200 transition-colors"
                        title="Reply tone settings"
                      >
                        <Settings2 className="h-3.5 w-3.5 text-gray-500" />
                      </button>
                      {replyLogEntries.length > 0 && (
                        <>
                          <button
                            onClick={() => setAutoReplyExpanded(!autoReplyExpanded)}
                            className="p-1 rounded hover:bg-gray-200 transition-colors"
                            title={autoReplyExpanded ? 'Collapse reply log' : 'Expand reply log'}
                          >
                            {autoReplyExpanded ? (
                              <ChevronUp className="h-3.5 w-3.5 text-gray-500" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
                            )}
                          </button>
                          <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">
                            {replyLogEntries.length}
                          </span>
                        </>
                      )}
                      <button
                        onClick={toggleAutoReply}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          autoReplyEnabled ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                            autoReplyEnabled ? 'translate-x-4.5' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Tone Settings Panel */}
                  {showToneSettings && (
                    <div className="mt-2 p-2 bg-white rounded border border-gray-200 space-y-2">
                      <div>
                        <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">
                          Reply Tone
                        </label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {[
                            { value: 'professional', label: 'Professional', icon: Globe },
                            { value: 'friendly', label: 'Friendly', icon: MessageSquare },
                            { value: 'formal', label: 'Formal', icon: Mail },
                            { value: 'hindi', label: 'Hindi', icon: Languages },
                            { value: 'hinglish', label: 'Hinglish', icon: Languages },
                          ].map(({ value, label, icon: Icon }) => (
                            <button
                              key={value}
                              onClick={() => setAutoReplyTone(value)}
                              className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                                autoReplyTone === value
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              <Icon className="h-3 w-3" />
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">
                          Custom Instructions (optional)
                        </label>
                        <textarea
                          value={autoReplyCustomInstructions}
                          onChange={(e) => setAutoReplyCustomInstructions(e.target.value)}
                          placeholder="e.g., Always mention I'll respond in detail within 24 hours..."
                          rows={2}
                          className="mt-1 w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                      </div>
                      <button
                        onClick={saveToneConfig}
                        className="w-full px-2 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors"
                      >
                        Save Settings
                      </button>
                    </div>
                  )}

                  {/* Reply Log */}
                  {autoReplyExpanded && replyLogEntries.length > 0 && (
                    <div className="mt-2 max-h-48 overflow-y-auto space-y-1.5">
                      {replyLogEntries.slice().reverse().map((entry, i) => (
                        <div
                          key={entry.threadId + '-' + i}
                          className="p-2 bg-green-50 rounded border border-green-100 text-xs"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-gray-800 truncate max-w-[60%]">
                              {entry.from.replace(/<.*>/, '').trim()}
                            </span>
                            <span className="text-gray-400 text-[10px] flex-shrink-0">
                              {new Date(entry.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="text-gray-600 truncate mb-1">
                            Re: {entry.subject}
                          </div>
                          <div className="text-gray-700 line-clamp-2">
                            {entry.aiReply}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-12 text-gray-400">
                    <Bot className="h-12 w-12 mb-3" />
                    <p className="text-sm">Start a conversation</p>
                    <p className="text-xs mt-1">Switch between AI and WhatsApp mode</p>
                  </div>
                ) : (
                  chatMessages.map((msg, i) => (
                    <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.role === 'assistant' && (
                        <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                          msg.mode === 'ai' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {msg.mode === 'ai' ? 'AI' : 'WA'}
                        </div>
                      )}
                      <div className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {msg.image && (
                          <img src={msg.image} alt="Attached" className="max-w-full max-h-48 rounded mb-2" />
                        )}
                        {msg.text && msg.text !== '(image)' && <p className="whitespace-pre-wrap">{msg.text}</p>}
                      </div>
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="border-t bg-gray-50 p-3">
                {pendingImage && (
                  <div className="mb-2 relative inline-block">
                    <img src={pendingImage.preview} alt="Preview" className="max-h-24 rounded border" />
                    <button
                      onClick={() => setPendingImage(null)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                <div className="flex gap-2">
                  <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageSelect} className="hidden" />
                  {chatMode === 'ai' && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={sending}
                      className="px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                      title="Attach image"
                    >
                      <Paperclip className="h-4 w-4" />
                    </button>
                  )}
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    placeholder={chatMode === 'ai' ? 'Ask AI anything...' : 'Send WhatsApp message...'}
                    disabled={sending}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={sending || (!chatInput.trim() && !pendingImage)}
                    className={`px-3 py-2 rounded-lg text-white transition-colors disabled:opacity-50 ${
                      chatMode === 'ai'
                        ? 'bg-purple-600 hover:bg-purple-700'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {sending ? <Loader className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
