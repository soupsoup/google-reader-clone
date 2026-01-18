import { useState } from 'react';
import { X, Loader2, Rss, FileUp } from 'lucide-react';
import type { FolderWithFeeds } from '../../types';

interface AddFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFeed: (params: { url: string; folderId?: string }) => Promise<unknown>;
  isLoading: boolean;
  folders: FolderWithFeeds[];
}

export function AddFeedModal({
  isOpen,
  onClose,
  onAddFeed,
  isLoading,
  folders,
}: AddFeedModalProps) {
  const [url, setUrl] = useState('');
  const [folderId, setFolderId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'url' | 'opml'>('url');
  const [opmlFile, setOpmlFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!url.trim()) {
      setError('Please enter a feed URL');
      return;
    }

    try {
      await onAddFeed({ url: url.trim(), folderId: folderId || undefined });
      setUrl('');
      setFolderId('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add feed');
    }
  };

  const handleOpmlImport = async () => {
    if (!opmlFile) return;
    setImporting(true);
    setError(null);

    try {
      const text = await opmlFile.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/xml');
      const outlines = doc.querySelectorAll('outline[xmlUrl], outline[xmlurl]');

      let successCount = 0;
      let failCount = 0;

      for (const outline of outlines) {
        const feedUrl = outline.getAttribute('xmlUrl') || outline.getAttribute('xmlurl');
        if (feedUrl) {
          try {
            await onAddFeed({ url: feedUrl });
            successCount++;
          } catch {
            failCount++;
          }
        }
      }

      setOpmlFile(null);
      alert(`Imported ${successCount} feeds. ${failCount > 0 ? `${failCount} failed.` : ''}`);
      if (successCount > 0) {
        onClose();
      }
    } catch (err) {
      setError('Failed to parse OPML file');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded shadow-xl w-full max-w-md border border-gray-300">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-300 bg-[#f5f5f5]">
          <h2 className="text-[15px] font-bold text-gray-800">Add a subscription</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        <div className="flex border-b border-gray-300">
          <button
            onClick={() => setTab('url')}
            className={`flex-1 px-4 py-2 text-[13px] font-medium ${
              tab === 'url'
                ? 'text-[#15c] border-b-2 border-[#c74a35] bg-white'
                : 'text-gray-600 hover:text-gray-800 bg-[#f5f5f5]'
            }`}
          >
            <Rss className="h-4 w-4 inline-block mr-2" />
            Feed URL
          </button>
          <button
            onClick={() => setTab('opml')}
            className={`flex-1 px-4 py-2 text-[13px] font-medium ${
              tab === 'opml'
                ? 'text-[#15c] border-b-2 border-[#c74a35] bg-white'
                : 'text-gray-600 hover:text-gray-800 bg-[#f5f5f5]'
            }`}
          >
            <FileUp className="h-4 w-4 inline-block mr-2" />
            Import OPML
          </button>
        </div>

        <div className="p-4">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded text-[13px]">
              {error}
            </div>
          )}

          {tab === 'url' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="feedUrl"
                  className="block text-[13px] font-medium text-gray-700 mb-1"
                >
                  Feed URL
                </label>
                <input
                  id="feedUrl"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/feed.xml"
                  className="w-full px-3 py-2 border border-gray-400 rounded bg-white text-gray-900 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#15c] focus:border-[#15c]"
                  autoFocus
                />
                <p className="mt-1 text-[11px] text-gray-500">
                  Enter an RSS or Atom feed URL
                </p>
              </div>

              <div>
                <label
                  htmlFor="folder"
                  className="block text-[13px] font-medium text-gray-700 mb-1"
                >
                  Add to folder (optional)
                </label>
                <select
                  id="folder"
                  value={folderId}
                  onChange={(e) => setFolderId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-400 rounded bg-white text-gray-900 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#15c] focus:border-[#15c]"
                >
                  <option value="">No folder</option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-1.5 text-[13px] text-gray-700 bg-white hover:bg-gray-100 rounded border border-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-1.5 bg-[#c74a35] hover:bg-[#b5422f] text-white rounded text-[13px] font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Subscribe'
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1">
                  OPML File
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded p-6 text-center bg-[#fafafa]">
                  {opmlFile ? (
                    <div>
                      <p className="text-[13px] text-gray-900">{opmlFile.name}</p>
                      <button
                        onClick={() => setOpmlFile(null)}
                        className="text-[12px] text-red-600 hover:underline mt-2"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <>
                      <FileUp className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-[13px] text-gray-500 mb-2">
                        Drop your OPML file here or
                      </p>
                      <label className="cursor-pointer text-[13px] text-[#15c] hover:underline">
                        browse
                        <input
                          type="file"
                          accept=".opml,.xml"
                          onChange={(e) => setOpmlFile(e.target.files?.[0] || null)}
                          className="hidden"
                        />
                      </label>
                    </>
                  )}
                </div>
                <p className="mt-2 text-[11px] text-gray-500">
                  Import feeds from Google Reader, Feedly, or other RSS readers
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-1.5 text-[13px] text-gray-700 bg-white hover:bg-gray-100 rounded border border-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleOpmlImport}
                  disabled={!opmlFile || importing}
                  className="px-4 py-1.5 bg-[#c74a35] hover:bg-[#b5422f] text-white rounded text-[13px] font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {importing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    'Import'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
