import React, { useState, useEffect } from 'react';
import { X, Save, Edit, Plus, Info } from 'lucide-react';
import { Publication, DataLayer, ResearchTheme, Instrument, Person } from '../types';

interface EditModalProps {
  type: 'publication' | 'data-layer' | 'research-theme' | 'instrument' | 'person' | 'software' | 'teaching';
  item: any; // null if adding new
  onSave: (savedItem: any) => void;
  onClose: () => void;
}

export const EditModal: React.FC<EditModalProps> = ({
  type,
  item,
  onSave,
  onClose,
}) => {
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (item) {
      setFormData({ ...item });
    } else {
      // Default blank values for adding new items
      if (type === 'publication') {
        setFormData({
          title: '',
          authors: '',
          venue: '',
          year: new Date().getFullYear(),
          type: 'Peer-Reviewed Article',
          link: ''
        });
      } else if (type === 'data-layer') {
        setFormData({
          name: '',
          description: '',
          availability: 'Public',
          link: ''
        });
      } else if (type === 'research-theme') {
        setFormData({
          title: '',
          description: '',
          keywords: '',
          image: ''
        });
      } else if (type === 'instrument') {
        setFormData({
          name: '',
          description: '',
          category: 'Field Sensors',
          image: 'gps'
        });
      } else if (type === 'person') {
        setFormData({
          name: '',
          role: '',
          researchFocus: '',
          bio: '',
          email: '',
          scholar: '',
          linkedin: '',
          image: ''
        });
      } else if (type === 'software') {
        setFormData({
          title: '',
          description: '',
          language: 'Python',
          link: ''
        });
      } else if (type === 'teaching') {
        setFormData({
          title: '',
          course: '',
          description: '',
          link: '',
          updatedAt: new Date().toISOString().slice(0, 10)
        });
      }
    }
  }, [item, type]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image size exceeds 2MB limit. Please upload a smaller compressed image.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev: any) => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // For research theme, convert keywords string to array
    if (type === 'research-theme' && typeof formData.keywords === 'string') {
      formData.keywords = formData.keywords
        .split(',')
        .map((k: string) => k.trim())
        .filter((k: string) => k !== '');
    }

    onSave({
      ...formData,
      id: formData.id || `${type}-${Date.now()}`
    });
  };

  const getTitle = () => {
    const isEdit = !!item;
    const action = isEdit ? 'Edit' : 'Add New';
    switch (type) {
      case 'publication': return `${action} Publication`;
      case 'data-layer': return `${action} Data Layer`;
      case 'research-theme': return `${action} Research Theme`;
      case 'instrument': return `${action} Research Instrument`;
      case 'person': return `${action} Team Member Profile`;
      case 'software': return `${action} Software Tool / Model`;
      case 'teaching': return `${action} Teaching Material`;
      default: return 'Edit Item';
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-100 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="bg-[#9E1B32] text-white p-4 flex justify-between items-center">
          <h3 className="text-sm font-bold flex items-center space-x-1.5">
            <Edit className="w-4 h-4" />
            <span>{getTitle()}</span>
          </h3>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto bg-slate-50 text-xs">
          
          {/* Publication Form Fields */}
          {type === 'publication' && (
            <>
              <div className="space-y-1">
                <label className="block font-bold text-gray-700">Publication Title</label>
                <textarea
                  name="title"
                  value={formData.title || ''}
                  onChange={handleChange}
                  rows={2}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded focus:outline-none focus:border-[#9E1B32]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-gray-700">Authors (Comma separated)</label>
                <input
                  type="text"
                  name="authors"
                  placeholder="e.g., Liu, H., Purushothaman, N."
                  value={formData.authors || ''}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded focus:outline-none focus:border-[#9E1B32]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-gray-700">Year</label>
                  <input
                    type="number"
                    name="year"
                    value={formData.year || new Date().getFullYear()}
                    onChange={handleChange}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded focus:outline-none focus:border-[#9E1B32]"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-gray-700">Category Type</label>
                  <select
                    name="type"
                    value={formData.type || 'Peer-Reviewed Article'}
                    onChange={handleChange}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded focus:outline-none focus:border-[#9E1B32]"
                  >
                    <option value="Peer-Reviewed Article">Peer-Reviewed Article</option>
                    <option value="Conference">Conference Proceeding / Presentation</option>
                    <option value="Other">Other Publication / Report</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-gray-700">Journal Venue / Volume Details</label>
                <input
                  type="text"
                  name="venue"
                  placeholder="e.g., Remote Sensing of Environment, 250, 112000"
                  value={formData.venue || ''}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded focus:outline-none focus:border-[#9E1B32]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-gray-700">DOI or URL Link (Optional)</label>
                <input
                  type="url"
                  name="link"
                  placeholder="e.g., https://doi.org/10.1016/..."
                  value={formData.link || ''}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded focus:outline-none focus:border-[#9E1B32]"
                />
              </div>
            </>
          )}

          {/* Data Layer Form Fields */}
          {type === 'data-layer' && (
            <>
              <div className="space-y-1">
                <label className="block font-bold text-gray-700">Dataset Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g., Mobile River UAV Maps"
                  value={formData.name || ''}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded focus:outline-none focus:border-[#9E1B32]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-gray-700">Description</label>
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={handleChange}
                  rows={3}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded focus:outline-none focus:border-[#9E1B32]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-gray-700">Availability Rights</label>
                <select
                  name="availability"
                  value={formData.availability || 'Public'}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded focus:outline-none focus:border-[#9E1B32]"
                >
                  <option value="Public">Public (Anyone can access)</option>
                  <option value="Request">Request (Requires contact approval)</option>
                  <option value="Internal">Internal (Lab-members only)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-gray-700">Access Link (Optional)</label>
                <input
                  type="url"
                  name="link"
                  placeholder="e.g., https://dataverse.harvard.edu/..."
                  value={formData.link || ''}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded focus:outline-none focus:border-[#9E1B32]"
                />
              </div>
            </>
          )}

          {/* Research Theme Form Fields */}
          {type === 'research-theme' && (
            <>
              <div className="space-y-1">
                <label className="block font-bold text-gray-700">Theme Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title || ''}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded focus:outline-none focus:border-[#9E1B32]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-gray-700">Description</label>
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={handleChange}
                  rows={4}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded focus:outline-none focus:border-[#9E1B32]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-gray-700">Keywords (Comma separated list)</label>
                <input
                  type="text"
                  name="keywords"
                  placeholder="e.g., Remote Sensing, Hydrology, Deep Learning"
                  value={
                    Array.isArray(formData.keywords) 
                      ? formData.keywords.join(', ') 
                      : formData.keywords || ''
                  }
                  onChange={handleChange}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded focus:outline-none focus:border-[#9E1B32]"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block font-bold text-gray-700">Research Theme Banner Photo</label>
                <div className="bg-slate-50 p-4 rounded-lg border border-dashed border-gray-300 flex flex-col items-center justify-center space-y-3 relative group hover:border-[#9E1B32] transition-colors">
                  {formData.image && (formData.image.startsWith('data:') || formData.image.startsWith('http') || formData.image.includes('.')) ? (
                    <div className="flex items-center space-x-4 w-full">
                      <img 
                        src={formData.image} 
                        alt="Preview" 
                        className="w-16 h-16 rounded object-cover border border-gray-200 shadow-xs shrink-0" 
                      />
                      <div className="flex-1 text-left">
                        <p className="text-xs font-bold text-gray-700 truncate">Theme Photo Selected</p>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                          {formData.image.startsWith('data:') ? 'Local Image File' : 'External Web URL Asset'}
                        </p>
                        <button
                          type="button"
                          onClick={() => setFormData((prev: any) => ({ ...prev, image: '' }))}
                          className="text-red-600 hover:text-red-800 text-[10px] font-bold uppercase mt-1 tracking-wider block hover:underline"
                        >
                          Clear Photo Selection
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-2">
                      <span className="text-2xl">📷</span>
                      <p className="text-xs font-bold text-gray-600 mt-1">Upload theme banner from local browser</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Drag & drop or click to choose file (Max 2MB)</p>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                    title="Choose local image file"
                  />
                </div>

                <div className="pt-1">
                  <input
                    type="text"
                    name="image"
                    placeholder="Or paste custom image URL instead..."
                    value={(formData.image && !formData.image.startsWith('data:')) ? formData.image : ''}
                    onChange={handleChange}
                    className="w-full p-2 bg-white border border-gray-300 rounded text-xs focus:outline-none focus:border-[#9E1B32]"
                  />
                </div>
              </div>
            </>
          )}

          {/* Instrument Form Fields */}
          {type === 'instrument' && (
            <>
              <div className="space-y-1">
                <label className="block font-bold text-gray-700">Equipment Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded focus:outline-none focus:border-[#9E1B32]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-gray-700">Instrument Category</label>
                <input
                  type="text"
                  name="category"
                  placeholder="e.g., Hydrologic Field Sensors"
                  value={formData.category || ''}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded focus:outline-none focus:border-[#9E1B32]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-gray-700">Specifications & Description</label>
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={handleChange}
                  rows={3}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded focus:outline-none focus:border-[#9E1B32]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-gray-700">Operating Manual / SOP Link (Optional)</label>
                <input
                  type="url"
                  name="manualLink"
                  placeholder="e.g., https://ua.box.com/s/manual-pdf"
                  value={formData.manualLink || ''}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded focus:outline-none focus:border-[#9E1B32]"
                />
              </div>

              <div className="space-y-2">
                <label className="block font-bold text-gray-700">Equipment Display Image</label>
                <div className="bg-slate-50 p-4 rounded-lg border border-dashed border-gray-300 flex flex-col items-center justify-center space-y-3 relative group hover:border-[#9E1B32] transition-colors">
                  {formData.image && (formData.image.startsWith('data:') || formData.image.startsWith('http') || formData.image.includes('.')) ? (
                    <div className="flex items-center space-x-4 w-full">
                      <img 
                        src={formData.image} 
                        alt="Preview" 
                        className="w-16 h-16 rounded object-cover border border-gray-200 shadow-xs shrink-0" 
                      />
                      <div className="flex-1 text-left">
                        <p className="text-xs font-bold text-gray-700 truncate">Equipment Photo Selected</p>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                          {formData.image.startsWith('data:') ? 'Local Image File' : 'External Web URL Asset'}
                        </p>
                        <button
                          type="button"
                          onClick={() => setFormData((prev: any) => ({ ...prev, image: '' }))}
                          className="text-red-600 hover:text-red-800 text-[10px] font-bold uppercase mt-1 tracking-wider block hover:underline"
                        >
                          Clear Photo Selection
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-2">
                      <span className="text-2xl">📷</span>
                      <p className="text-xs font-bold text-gray-600 mt-1">Upload equipment image from local browser</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Drag & drop or click to choose file (Max 2MB)</p>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                    title="Choose local image file"
                  />
                </div>

                <div className="pt-1">
                  <input
                    type="text"
                    name="image"
                    placeholder="Or paste custom image URL instead..."
                    value={(formData.image && !formData.image.startsWith('data:')) ? formData.image : ''}
                    onChange={handleChange}
                    className="w-full p-2 bg-white border border-gray-300 rounded text-xs focus:outline-none focus:border-[#9E1B32]"
                  />
                </div>
              </div>
            </>
          )}

          {/* Team Member / Person Form Fields */}
          {type === 'person' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-gray-700">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleChange}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded focus:outline-none focus:border-[#9E1B32]"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-gray-700">Academic Role</label>
                  <input
                    type="text"
                    name="role"
                    placeholder="e.g., Assistant Professor"
                    value={formData.role || ''}
                    onChange={handleChange}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded focus:outline-none focus:border-[#9E1B32]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-gray-700">Research Focus Areas</label>
                <input
                  type="text"
                  name="researchFocus"
                  placeholder="e.g., UAV mapping, satellite SAR hydrology"
                  value={formData.researchFocus || ''}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded focus:outline-none focus:border-[#9E1B32]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-gray-700">Biography / Research Background</label>
                <textarea
                  name="bio"
                  value={formData.bio || ''}
                  onChange={handleChange}
                  rows={4}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded focus:outline-none focus:border-[#9E1B32]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-gray-700">University Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="e.g., student@ua.edu"
                  value={formData.email || ''}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded focus:outline-none focus:border-[#9E1B32]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-gray-700">Google Scholar Profile Link</label>
                  <input
                    type="url"
                    name="scholar"
                    value={formData.scholar || ''}
                    onChange={handleChange}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded focus:outline-none focus:border-[#9E1B32]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-gray-700">LinkedIn Profile Link</label>
                  <input
                    type="url"
                    name="linkedin"
                    value={formData.linkedin || ''}
                    onChange={handleChange}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded focus:outline-none focus:border-[#9E1B32]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block font-bold text-gray-700">Profile Portrait Photo</label>
                <div className="bg-slate-50 p-4 rounded-lg border border-dashed border-gray-300 flex flex-col items-center justify-center space-y-3 relative group hover:border-[#9E1B32] transition-colors">
                  {formData.image && (formData.image.startsWith('data:') || formData.image.startsWith('http') || formData.image.includes('.')) ? (
                    <div className="flex items-center space-x-4 w-full">
                      <img 
                        src={formData.image} 
                        alt="Preview" 
                        className="w-16 h-16 rounded-full object-cover border border-gray-200 shadow-xs shrink-0" 
                      />
                      <div className="flex-1 text-left">
                        <p className="text-xs font-bold text-gray-700 truncate">Portrait Photo Selected</p>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                          {formData.image.startsWith('data:') ? 'Local Image File' : 'External Web URL Asset'}
                        </p>
                        <button
                          type="button"
                          onClick={() => setFormData((prev: any) => ({ ...prev, image: '' }))}
                          className="text-red-600 hover:text-red-800 text-[10px] font-bold uppercase mt-1 tracking-wider block hover:underline"
                        >
                          Clear Portrait Selection
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-2">
                      <span className="text-2xl">👤</span>
                      <p className="text-xs font-bold text-gray-600 mt-1">Upload profile photo from local browser</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Drag & drop or click to choose file (Max 2MB)</p>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                    title="Choose local image file"
                  />
                </div>

                <div className="pt-1">
                  <input
                    type="text"
                    name="image"
                    placeholder="Or paste custom image URL instead..."
                    value={(formData.image && !formData.image.startsWith('data:')) ? formData.image : ''}
                    onChange={handleChange}
                    className="w-full p-2 bg-white border border-gray-300 rounded text-xs focus:outline-none focus:border-[#9E1B32]"
                  />
                </div>
              </div>
            </>
          )}

          {/* Software Form Fields */}
          {type === 'software' && (
            <>
              <div className="space-y-1">
                <label className="block font-bold text-gray-700">Software / Model Name</label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g., reach-scale-river-depth-extractor"
                  value={formData.title || ''}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded focus:outline-none focus:border-[#9E1B32]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-gray-700">Primary Programming Language</label>
                <select
                  name="language"
                  value={formData.language || 'Python'}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded focus:outline-none focus:border-[#9E1B32]"
                >
                  <option value="Python">Python</option>
                  <option value="R">R Language</option>
                  <option value="JavaScript">JavaScript (GEE)</option>
                  <option value="Other">Other Language</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-gray-700">Description & Release Features</label>
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={handleChange}
                  rows={4}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded focus:outline-none focus:border-[#9E1B32]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-gray-700">GitHub Repository / Sandbox Link</label>
                <input
                  type="url"
                  name="link"
                  placeholder="e.g., https://github.com/ua-ersl/..."
                  value={formData.link || ''}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded focus:outline-none focus:border-[#9E1B32]"
                />
              </div>
            </>
          )}

          {/* Teaching Material Form Fields */}
          {type === 'teaching' && (
            <>
              <div className="space-y-1">
                <label className="block font-bold text-gray-700">Resource / Handout Name</label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g., Lab Guide 4: UAV Multispectral Calibration"
                  value={formData.title || ''}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded focus:outline-none focus:border-[#9E1B32]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-gray-700">Course Affiliation / Subject</label>
                <input
                  type="text"
                  name="course"
                  placeholder="e.g., GY 404/504: Advanced Remote Sensing"
                  value={formData.course || ''}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded focus:outline-none focus:border-[#9E1B32]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-gray-700">Syllabus Details & Practical Guidance</label>
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={handleChange}
                  rows={4}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded focus:outline-none focus:border-[#9E1B32]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-gray-700">Download Link / Box Resource URL</label>
                <input
                  type="url"
                  name="link"
                  placeholder="e.g., https://ua.box.com/s/..."
                  value={formData.link || ''}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded focus:outline-none focus:border-[#9E1B32]"
                />
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 font-bold transition-all hover:cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#9E1B32] hover:bg-red-800 text-white rounded font-bold shadow-md transition-all hover:cursor-pointer flex items-center space-x-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
