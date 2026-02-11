'use client';

import { useState, useEffect } from 'react';
import { Video, Upload, Download, FileText, Clock, Calendar, Trash2, Play, Search } from 'lucide-react';
import { DAYS_IN_WEEK } from '@/lib/utils';

interface Transcript {
  filename: string;
  date: string;
  duration: string;
  wordCount: number;
  size: string;
  hasJson: boolean;
  hasSrt: boolean;
}

export default function ZoomMeetings() {
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedTranscript, setSelectedTranscript] = useState<string | null>(null);
  const [transcriptContent, setTranscriptContent] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'recent' | 'today'>('all');

  useEffect(() => {
    fetchTranscripts();
  }, []);

  const fetchTranscripts = async () => {
    try {
      const response = await fetch('/api/zoom/transcripts');
      const data = await response.json();
      setTranscripts(data.transcripts || []);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/zoom/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        await fetchTranscripts();
        alert('Transcription completed successfully!');
      } else {
        const error = await response.json();
        alert(`Transcription failed: ${error.error}`);
      }
    } catch {
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const viewTranscript = async (filename: string) => {
    try {
      const response = await fetch(`/api/zoom/transcript/${encodeURIComponent(filename)}`);
      const data = await response.json();
      setTranscriptContent(data.content);
      setSelectedTranscript(filename);
    } catch {
      // Silently fail - user will see no content loaded
    }
  };

  const downloadFile = (filename: string, type: 'txt' | 'json' | 'srt') => {
    const extension = type === 'txt' ? '' : `.${type}`;
    window.open(`/api/zoom/download/${encodeURIComponent(filename)}${extension}?type=${type}`, '_blank');
  };

  const deleteTranscript = async (filename: string) => {
    if (!confirm(`Delete ${filename}? This will remove all associated files (txt, json, srt).`)) {
      return;
    }

    try {
      const response = await fetch(`/api/zoom/transcript/${encodeURIComponent(filename)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchTranscripts();
        if (selectedTranscript === filename) {
          setSelectedTranscript(null);
          setTranscriptContent('');
        }
      }
    } catch {
      alert('Failed to delete transcript. Please try again.');
    }
  };

  const filteredTranscripts = transcripts.filter(t => {
    const matchesSearch = t.filename.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterMode === 'today') {
      const today = new Date().toISOString().split('T')[0];
      return matchesSearch && t.date.includes(today);
    }

    if (filterMode === 'recent') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - DAYS_IN_WEEK);
      const transcriptDate = new Date(t.date);
      return matchesSearch && transcriptDate >= weekAgo;
    }

    return matchesSearch;
  });

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-3 rounded-lg">
            <Video className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Zoom Meetings</h2>
            <p className="text-sm text-gray-500">{transcripts.length} transcripts available</p>
          </div>
        </div>

        {/* Upload Button */}
        <label className="cursor-pointer">
          <input
            type="file"
            accept="video/*,audio/*"
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            uploading
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
          } text-white transition-colors`}>
            <Upload className="h-5 w-5" />
            <span>{uploading ? 'Transcribing...' : 'Upload & Transcribe'}</span>
          </div>
        </label>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search transcripts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'recent', 'today'] as const).map((mode) => (
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transcripts List */}
        <div className="space-y-4 max-h-[600px] overflow-y-auto">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading transcripts...</div>
          ) : filteredTranscripts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {searchQuery ? 'No transcripts found matching your search' : 'No transcripts yet. Upload a Zoom recording to get started!'}
            </div>
          ) : (
            filteredTranscripts.map((transcript, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 transition-all cursor-pointer ${
                  selectedTranscript === transcript.filename
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => viewTranscript(transcript.filename)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">{transcript.filename}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(transcript.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{transcript.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        <span>{transcript.wordCount} words</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          viewTranscript(transcript.filename);
                        }}
                        className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
                      >
                        <Play className="h-3 w-3" />
                        View
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadFile(transcript.filename, 'txt');
                        }}
                        className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm"
                      >
                        <Download className="h-3 w-3" />
                        TXT
                      </button>
                      {transcript.hasJson && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadFile(transcript.filename, 'json');
                          }}
                          className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 text-sm"
                        >
                          <Download className="h-3 w-3" />
                          JSON
                        </button>
                      )}
                      {transcript.hasSrt && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadFile(transcript.filename, 'srt');
                          }}
                          className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 text-sm"
                        >
                          <Download className="h-3 w-3" />
                          SRT
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTranscript(transcript.filename);
                        }}
                        className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Transcript Viewer */}
        <div className="border border-gray-200 rounded-lg p-6 bg-gray-50 max-h-[600px] overflow-y-auto">
          {selectedTranscript ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Transcript Preview</h3>
                <button
                  onClick={() => {
                    setSelectedTranscript(null);
                    setTranscriptContent('');
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Close
                </button>
              </div>
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 leading-relaxed">
                  {transcriptContent}
                </pre>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <FileText className="h-16 w-16 mb-4" />
              <p className="text-lg">Select a transcript to view</p>
            </div>
          )}
        </div>
      </div>

      {/* Upload Instructions */}
      {transcripts.length === 0 && !loading && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">How to use:</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
            <li>Click "Upload & Transcribe" to select a Zoom recording (MP4, MOV, or audio file)</li>
            <li>Wait for the AI transcription to complete (using OpenAI Whisper API)</li>
            <li>View, download, or share your transcripts</li>
            <li>Transcripts are automatically saved with timestamps and word counts</li>
          </ol>
        </div>
      )}
    </div>
  );
}
