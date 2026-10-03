import React, { useState, useRef } from 'react';
import { 
  Folder, File, Upload, Search, Plus, Trash2, ArrowLeft, Download, 
  Share2, Tag, Loader2, FolderPlus, Info, Check, AlertCircle, FileSpreadsheet, FileCode, FileImage 
} from 'lucide-react';
import { BoxFile, User } from '../types';

interface BoxExplorerProps {
  files: BoxFile[];
  currentUser: User | null;
  onAddFile: (file: BoxFile) => void;
  onDeleteFile: (id: string) => void;
}

export const BoxExplorer: React.FC<BoxExplorerProps> = ({
  files,
  currentUser,
  onAddFile,
  onDeleteFile,
}) => {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter files in the current folder
  const currentFiles = files.filter(f => f.parentId === currentFolderId);

  // Filter by search query
  const filteredFiles = currentFiles.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (f.tags && f.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesSearch;
  });

  // Get current folder info for breadcrumb
  const currentFolder = files.find(f => f.id === currentFolderId);

  // Drag and Drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const simulateUpload = (fileName: string, sizeBytes: number) => {
    if (currentUser?.role === 'Viewer') {
      alert('Permission Denied: Public Viewers cannot upload or modify Box files.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const sizeStr = sizeBytes > 1024 * 1024
      ? `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`
      : `${(sizeBytes / 1024).toFixed(0)} KB`;

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          
          // Complete upload
          const newFile: BoxFile = {
            id: `box-file-${Date.now()}`,
            name: fileName,
            type: 'file',
            size: sizeStr,
            updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
            updatedBy: currentUser?.name || 'Researcher',
            parentId: currentFolderId,
            tags: selectedTag ? [selectedTag] : ['Uploaded']
          };

          onAddFile(newFile);
          setUploading(false);
          setSelectedTag('');
          return 100;
        }
        return prev + 25;
      });
    }, 250);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      simulateUpload(file.name, file.size);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      simulateUpload(file.name, file.size);
    }
  };

  const uploadHandlers = { handleDrop, handleFileSelect };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim() || currentUser?.role === 'Viewer') return;

    const newFolder: BoxFile = {
      id: `box-folder-${Date.now()}`,
      name: newFolderName.trim(),
      type: 'folder',
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      updatedBy: currentUser?.name || 'Researcher',
      parentId: currentFolderId
    };

    onAddFile(newFolder);
    setNewFolderName('');
    setShowNewFolderInput(false);
  };

  // Helper to render file icons dynamically based on extension
  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['csv', 'xlsx', 'xls'].includes(ext || '')) {
      return <FileSpreadsheet className="w-5 h-5 text-green-600 shrink-0" />;
    }
    if (['geojson', 'tif', 'h5', 'shp', 'py', 'r'].includes(ext || '')) {
      return <FileCode className="w-5 h-5 text-purple-600 shrink-0" />;
    }
    if (['png', 'jpg', 'jpeg', 'gif', 'svg'].includes(ext || '')) {
      return <FileImage className="w-5 h-5 text-amber-500 shrink-0" />;
    }
    return <File className="w-5 h-5 text-blue-500 shrink-0" />;
  };

  const allTags = Array.from(
    new Set(files.flatMap(f => f.tags || []))
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden select-none">
      {/* Box Header Integration */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-5 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-white text-blue-600 font-extrabold text-xs px-2 py-0.5 rounded-full shadow-sm">BOX SECURE</span>
            <h2 className="text-lg font-bold">University Box Cloud Dataspace</h2>
          </div>
          <p className="text-xs text-blue-100 mt-1">
            Official University of Alabama Box Enterprise Storage for ERSL team files, raw sensor readings, and satellite imagery.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="bg-blue-500/30 border border-blue-400/20 px-3 py-1.5 rounded flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="font-semibold text-blue-50">Enterprise Sync Active</span>
          </div>
          <div className="bg-blue-500/30 border border-blue-400/20 px-3 py-1.5 rounded text-blue-50 font-semibold">
            Allocated Space: <span className="font-bold">Unlimited</span>
          </div>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Explorer View */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          
          {/* Controls Bar: Breadcrumbs & Actions */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            {/* Breadcrumb path */}
            <div className="flex items-center space-x-2 text-sm font-semibold text-gray-500">
              <button 
                onClick={() => setCurrentFolderId(null)}
                className="hover:text-blue-600 transition-colors cursor-pointer"
              >
                Box Root
              </button>
              {currentFolderId && (
                <>
                  <span className="text-gray-300">/</span>
                  <span className="text-gray-800 font-bold max-w-[150px] truncate">{currentFolder?.name}</span>
                </>
              )}
            </div>

            {/* Folder Actions */}
            {currentUser?.role !== 'Viewer' && (
              <div className="flex items-center space-x-2 w-full md:w-auto">
                {currentFolderId && (
                  <button
                    onClick={() => {
                      const parent = files.find(f => f.id === currentFolderId);
                      setCurrentFolderId(parent ? parent.parentId : null);
                    }}
                    className="flex items-center space-x-1.5 text-xs font-bold text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 py-1.5 px-3 rounded-md transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                )}

                <button
                  onClick={() => setShowNewFolderInput(!showNewFolderInput)}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>New Folder</span>
                </button>
              </div>
            )}
          </div>

          {/* New folder creation popover input */}
          {showNewFolderInput && (
            <form onSubmit={handleCreateFolder} className="flex items-center space-x-2 bg-slate-50 p-3 rounded-lg border border-gray-200">
              <input
                type="text"
                placeholder="Folder name (e.g., Drone Flights Oct)"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="flex-1 text-xs p-2 bg-white rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                required
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-4 rounded transition-colors cursor-pointer"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => {
                  setNewFolderName('');
                  setShowNewFolderInput(false);
                }}
                className="text-xs text-gray-400 hover:text-gray-600 py-2 px-3 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
            </form>
          )}

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search files by name or tag in this folder..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500 bg-gray-50/50"
            />
          </div>

          {/* Files List Table/Grid */}
          <div className="border border-gray-100 rounded-lg overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/75 border-b border-gray-100 text-gray-400 text-[10px] uppercase font-extrabold tracking-wider">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4 hidden md:table-cell">Metadata Tags</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4 hidden sm:table-cell">Updated By</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredFiles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-400">
                      <Folder className="w-10 h-10 mx-auto text-gray-200 mb-2" />
                      <p className="text-xs font-bold text-gray-500">Folder is empty or search returned no results.</p>
                      <p className="text-[10px] text-gray-400 mt-1">Upload a file or create a folder to get started.</p>
                    </td>
                  </tr>
                ) : (
                  filteredFiles.map((file) => (
                    <tr key={file.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="py-3.5 px-4 font-semibold text-xs text-gray-800">
                        {file.type === 'folder' ? (
                          <button
                            onClick={() => {
                              setCurrentFolderId(file.id);
                              setSearchQuery('');
                            }}
                            className="flex items-center space-x-2.5 text-blue-600 hover:text-blue-800 text-left focus:outline-none cursor-pointer hover:underline"
                          >
                            <Folder className="w-5 h-5 text-blue-500 shrink-0 fill-blue-50" />
                            <span className="truncate max-w-[200px] font-bold">{file.name}</span>
                          </button>
                        ) : (
                          <div className="flex items-center space-x-2.5">
                            {getFileIcon(file.name)}
                            <span className="truncate max-w-[200px] text-gray-700">{file.name}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {file.tags && file.tags.map(t => (
                            <span key={t} className="inline-flex items-center px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-[9px] font-bold border border-blue-100">
                              <Tag className="w-2 h-2 mr-0.5 shrink-0" />
                              {t}
                            </span>
                          ))}
                          {file.type === 'folder' && <span className="text-gray-400 text-[10px]">-</span>}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-gray-500 font-medium">
                        {file.size || 'Folder'}
                      </td>
                      <td className="py-3.5 px-4 hidden sm:table-cell text-xs text-gray-500 font-semibold truncate max-w-[120px]">
                        {file.updatedBy}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                          {file.type === 'file' && (
                            <button
                              onClick={() => {
                                // Simulate mock file download
                                const element = document.createElement("a");
                                const fileContent = `MOCK UNIVERSITY DATA STREAM FOR ${file.name}.\nThis simulates a real Box Enterprise file fetch.`;
                                const textFile = new Blob([fileContent], {type: 'text/plain'});
                                element.href = URL.createObjectURL(textFile);
                                element.download = file.name;
                                document.body.appendChild(element);
                                element.click();
                                document.body.removeChild(element);
                              }}
                              title="Download File"
                              className="p-1 hover:bg-gray-100 text-gray-600 hover:text-blue-600 rounded cursor-pointer transition-colors"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              alert(`Secure Box Link generated:\nhttps://ua.box.com/s/ersl-${file.id}\n(Copied to Clipboard)`);
                              navigator.clipboard.writeText(`https://ua.box.com/s/ersl-${file.id}`);
                            }}
                            title="Generate Secure Share Link"
                            className="p-1 hover:bg-gray-100 text-gray-600 hover:text-green-600 rounded cursor-pointer transition-colors"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                          {currentUser?.role !== 'Viewer' && (
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to remove "${file.name}" from our collaborative Box folder?`)) {
                                  onDeleteFile(file.id);
                                }
                              }}
                              title="Delete Item"
                              className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Upload Panel & Metadata Info */}
        <div className="lg:col-span-4 space-y-6">
          {/* Upload Area */}
          <div className="bg-slate-50 border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-4 flex items-center">
              <Upload className="w-4 h-4 mr-1.5 text-blue-600 animate-bounce" />
              Upload Files to Box
            </h3>

            {uploading ? (
              <div className="border border-blue-100 bg-white rounded-lg p-5 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <p className="text-xs font-bold text-gray-700">Syncing to Box Cloud...</p>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                </div>
                <span className="text-[10px] font-bold text-blue-600">{uploadProgress}% Complete</span>
              </div>
            ) : (
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={uploadHandlers?.handleDrop}
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                  dragActive 
                    ? 'border-blue-600 bg-blue-50/40' 
                    : 'border-gray-300 hover:border-blue-500 hover:bg-white bg-white/75'
                }`}
              >
                <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-xs font-bold text-gray-700">Drag & Drop files here</p>
                <p className="text-[10px] text-gray-400 my-1">or click to browse local files</p>
                <input
                  type="file"
                  id="box-upload-file"
                  ref={fileInputRef}
                  onChange={uploadHandlers?.handleFileSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-1.5 px-4 rounded shadow-sm transition-colors cursor-pointer"
                >
                  Browse Files
                </button>
              </div>
            )}

            {/* Tag Selection for Upload */}
            <div className="mt-4">
              <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1">Target Tag metadata</label>
              <div className="flex flex-wrap gap-1.5">
                {['ADCP', 'UAV Survey', 'Sentinel-2', 'Manuscript', 'AI Model', 'Raw Data'].map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                    className={`px-2 py-1 rounded text-[10px] font-semibold border transition-all cursor-pointer ${
                      selectedTag === tag
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Secure Cloud Advisory Box */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-gray-800 flex items-center space-x-1">
              <Info className="w-4 h-4 text-blue-600" />
              <span>Box API Security Architecture</span>
            </h4>
            <div className="text-[11px] text-gray-600 leading-relaxed space-y-2">
              <p>
                University Box folders are accessed securely via the **Box Content API v2** using **OAuth 2.0 with JSON Web Tokens (JWT)** or a 3-legged user authorization.
              </p>
              <p>
                When a user signs on via **myBama SSO**, the app securely requests Box API tokens associated with the user\'s academic identity.
              </p>
              <div className="p-2.5 bg-white border border-blue-100 rounded font-mono text-[9px] text-blue-700 space-y-1">
                <p>// OAuth Token Exchange Scope</p>
                <p>authorization: "Bearer BoxUserToken_xxx"</p>
                <p>file_access: "item_read, item_upload"</p>
                <p>encryption: "AES-256 bits at rest"</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
