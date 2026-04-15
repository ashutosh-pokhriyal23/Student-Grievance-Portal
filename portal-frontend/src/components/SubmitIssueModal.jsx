import React, { useEffect, useRef, useState } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';

const INITIAL_FORM = {
  title: '',
  category: '',
  description: '',
  imageFile: null,
  imagePreview: '',
};

const CATEGORIES = [
  { label: 'Infrastructure', color: 'indigo' },
  { label: 'Water', color: 'cyan' },
  { label: 'Electricity', color: 'amber' },
  { label: 'Academic', color: 'purple' },
  { label: 'Mess', color: 'orange' },
  { label: 'Other', color: 'gray' },
];

const CATEGORY_STYLES = {
  Infrastructure: 'bg-indigo-600 text-white border-indigo-600',
  Water: 'bg-cyan-600 text-white border-cyan-600',
  Electricity: 'bg-amber-600 text-white border-amber-600',
  Academic: 'bg-purple-600 text-white border-purple-600',
  Mess: 'bg-orange-600 text-white border-orange-600',
  Other: 'bg-gray-700 text-white border-gray-700',
};

const SubmitIssueModal = ({ isOpen, onClose, onContinue, spaceName, isUploadingImage }) => {
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(isOpen);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);
  const exitTimerRef = useRef(null);
  const openRafRef = useRef(null);
  const closeRafRef = useRef(null);
  const wasOpenRef = useRef(isOpen);

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      if (exitTimerRef.current) {
        window.clearTimeout(exitTimerRef.current);
        exitTimerRef.current = null;
      }
      if (openRafRef.current) {
        window.cancelAnimationFrame(openRafRef.current);
      }
      openRafRef.current = window.requestAnimationFrame(() => {
        setIsRendered(true);
        setFormData(INITIAL_FORM);
        setErrors({});
        setIsVisible(true);
      });
    }

    if (!isOpen && wasOpenRef.current) {
      if (openRafRef.current) {
        window.cancelAnimationFrame(openRafRef.current);
        openRafRef.current = null;
      }
      if (closeRafRef.current) {
        window.cancelAnimationFrame(closeRafRef.current);
      }
      closeRafRef.current = window.requestAnimationFrame(() => {
        setIsVisible(false);
        exitTimerRef.current = window.setTimeout(() => setIsRendered(false), 220);
      });
    }
    wasOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (exitTimerRef.current) {
        window.clearTimeout(exitTimerRef.current);
      }
      if (openRafRef.current) {
        window.cancelAnimationFrame(openRafRef.current);
      }
      if (closeRafRef.current) {
        window.cancelAnimationFrame(closeRafRef.current);
      }
      if (formData.imagePreview) {
        URL.revokeObjectURL(formData.imagePreview);
      }
    };
  }, [formData.imagePreview]);

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.title.trim()) {
      nextErrors.title = 'Title is required';
    } else if (formData.title.length > 100) {
      nextErrors.title = 'Title must be 100 characters or fewer';
    }

    if (!formData.category) {
      nextErrors.category = 'Category is required';
    }

    if (!formData.description.trim()) {
      nextErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 20) {
      nextErrors.description = 'Description must be at least 20 characters';
    } else if (formData.description.length > 500) {
      nextErrors.description = 'Description must be 500 characters or fewer';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    if (errors[name]) {
      setErrors((current) => ({ ...current, [name]: '' }));
    }
  };

  const handleCategorySelect = (category) => {
    setFormData((current) => ({ ...current, category }));
    if (errors.category) {
      setErrors((current) => ({ ...current, category: '' }));
    }
  };

  const handleFileClick = () => {
    if (isUploadingImage) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors((current) => ({ ...current, imageFile: 'Please choose an image file' }));
      event.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((current) => ({ ...current, imageFile: 'Image must be 5MB or smaller' }));
      event.target.value = '';
      return;
    }

    setFormData((current) => {
      if (current.imagePreview) {
        URL.revokeObjectURL(current.imagePreview);
      }

      return {
        ...current,
        imageFile: file,
        imagePreview: URL.createObjectURL(file),
      };
    });

    if (errors.imageFile) {
      setErrors((current) => ({ ...current, imageFile: '' }));
    }
  };

  const removeImage = () => {
    setFormData((current) => {
      if (current.imagePreview) {
        URL.revokeObjectURL(current.imagePreview);
      }

      return { ...current, imageFile: null, imagePreview: '' };
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleContinue = () => {
    if (!validateForm()) return;

    onContinue({
      title: formData.title.trim(),
      category: formData.category,
      description: formData.description.trim(),
      imageFile: formData.imageFile,
    });
  };

  if (!isRendered) return null;

  const displayedUploading = isUploadingImage;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      <div
        className={`relative z-10 flex h-[95dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-[0_-8px_40px_rgba(0,0,0,0.15)] transform-gpu will-change-transform lg:max-w-3xl ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{
          transition: 'transform 220ms cubic-bezier(0.32, 0.72, 0, 1)',
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Raise an issue"
      >
        <div className="flex flex-shrink-0 flex-col border-b border-gray-100 bg-white">
          <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-gray-300" />
          <div className="flex items-start justify-between gap-4 px-5 py-4 sm:px-6">
            <div>
              <h2 className="text-xl font-bold text-primary sm:text-2xl">Raise an Issue</h2>
              <p className="mt-1 text-sm text-secondary">{spaceName}</p>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 rounded-full p-2 transition-colors hover:bg-gray-100"
              aria-label="Close"
            >
              <X size={22} className="text-secondary" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 pb-40 sm:px-6">
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-primary">
                Title <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.title}
                  onChange={handleInputChange}
                  name="title"
                  maxLength={100}
                  placeholder="Summarise the issue in one line"
                  className={`w-full rounded-2xl border bg-white px-4 py-3 pr-16 text-sm outline-none transition-all focus:border-accent-dept focus:ring-4 focus:ring-accent-dept/10 ${
                    errors.title ? 'border-red-400 bg-red-50' : 'border-gray-200'
                  }`}
                />
                <span className="absolute bottom-3 right-3 text-xs font-medium text-secondary">
                  {formData.title.length}/100
                </span>
              </div>
              {errors.title && <p className="mt-1 text-xs font-medium text-red-500">{errors.title}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-primary">
                Category <span className="text-red-500">*</span>
              </label>
              <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
                {CATEGORIES.map((category) => {
                  const isSelected = formData.category === category.label;
                  return (
                    <button
                      key={category.label}
                      type="button"
                      onClick={() => handleCategorySelect(category.label)}
                      className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition-all whitespace-nowrap ${
                        isSelected
                          ? CATEGORY_STYLES[category.label]
                          : 'border-gray-200 bg-white text-secondary hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {category.label}
                    </button>
                  );
                })}
              </div>
              {errors.category && <p className="mt-1 text-xs font-medium text-red-500">{errors.category}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-primary">
                Description <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <textarea
                  value={formData.description}
                  onChange={handleInputChange}
                  name="description"
                  maxLength={500}
                  placeholder="Describe the issue in detail. What happened? Where exactly?"
                  className={`w-full rounded-2xl border bg-white px-4 py-3 pr-16 text-sm outline-none transition-all focus:border-accent-dept focus:ring-4 focus:ring-accent-dept/10 resize-none transform-gpu will-change-[height] ${
                    errors.description ? 'border-red-400 bg-red-50' : 'border-gray-200'
                  }`}
                  rows={5}
                  style={{ minHeight: '120px', maxHeight: '160px', overflowY: 'auto' }}
                />
                <span className="absolute bottom-3 right-3 text-xs font-medium text-secondary">
                  {formData.description.length}/500
                </span>
              </div>
              {errors.description && (
                <p className="mt-1 text-xs font-medium text-red-500">{errors.description}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-primary">
                Upload Image <span className="text-secondary font-normal">(optional)</span>
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />

              <button
                type="button"
                onClick={handleFileClick}
                className={`relative flex min-h-[150px] w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed px-4 py-6 text-center transition-all ${
                  errors.imageFile ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-gray-50 hover:border-accent-dept/40 hover:bg-accent-dept/5'
                } ${displayedUploading ? 'cursor-wait' : 'cursor-pointer'}`}
                disabled={displayedUploading}
              >
                {formData.imagePreview ? (
                  <div className="relative h-full w-full">
                    <img
                      src={formData.imagePreview}
                      alt="Selected preview"
                      className="h-32 w-full rounded-xl object-cover"
                    />
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        removeImage();
                      }}
                      className="absolute right-2 top-2 rounded-full bg-black/70 p-1.5 text-white shadow-lg transition-transform hover:scale-105"
                      aria-label="Remove image"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    {displayedUploading ? (
                      <Loader2 size={28} className="animate-spin text-accent-dept" />
                    ) : (
                      <div className="rounded-2xl bg-white p-3 shadow-sm">
                        <ImagePlus size={28} className="text-accent-dept" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-primary">Attach a photo (optional)</p>
                      <p className="mt-1 text-xs text-secondary">JPG, PNG up to 5MB</p>
                    </div>
                  </div>
                )}

                {displayedUploading && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/75">
                    <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm">
                      <Loader2 size={16} className="animate-spin text-accent-dept" />
                      <span className="text-xs font-semibold text-primary">Uploading...</span>
                    </div>
                  </div>
                )}
              </button>
              {errors.imageFile && <p className="mt-1 text-xs font-medium text-red-500">{errors.imageFile}</p>}
            </div>

          </div>
        </div>

        <div className="flex flex-shrink-0 items-center gap-3 border-t border-gray-100 bg-white px-5 py-4 shadow-[0_-8px_24px_rgba(0,0,0,0.04)] sm:px-6">
          <button
            onClick={onClose}
            className="rounded-full border border-gray-200 px-4 py-3 text-sm font-semibold text-primary transition-colors hover:bg-gray-50"
          >
            Back
          </button>
          <button
            onClick={handleContinue}
            className="flex-1 rounded-full bg-accent-dept px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-accent-dept/90 active:scale-[0.99]"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmitIssueModal;
