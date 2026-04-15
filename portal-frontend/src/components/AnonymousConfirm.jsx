import React, { useEffect, useState } from 'react';
import { EyeOff, Loader2, User, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { createComplaint } from '../api/complaints';

const buildFilePath = (file) => {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
  return `complaint-images/${crypto.randomUUID()}-${safeName}`;
};

const uploadImage = async (file) => {
  if (!file) return null;
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }

  const filePath = buildFilePath(file);
  const { error: uploadError } = await supabase.storage
    .from('complaint-images')
    .upload(filePath, file, {
      contentType: file.type,
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage.from('complaint-images').getPublicUrl(filePath);
  return data.publicUrl;
};

const AnonymousConfirm = ({ isOpen, formData, spaceId, onSuccess, onBack, onClose, onUploadStateChange }) => {
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(isOpen);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeOption, setActiveOption] = useState(null);
  const exitTimerRef = React.useRef(null);
  const openRafRef = React.useRef(null);
  const wasOpenRef = React.useRef(isOpen);

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      if (exitTimerRef.current) {
        window.clearTimeout(exitTimerRef.current);
        exitTimerRef.current = null;
      }
      setIsRendered(true);
      if (openRafRef.current) {
        window.cancelAnimationFrame(openRafRef.current);
      }
      openRafRef.current = window.requestAnimationFrame(() => setIsVisible(true));
    }

    if (!isOpen && wasOpenRef.current) {
      setIsVisible(false);
      exitTimerRef.current = window.setTimeout(() => setIsRendered(false), 160);
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
    };
  }, []);

  if (!isRendered || !formData) return null;

  const handleSubmit = async (isAnonymous) => {
    setIsSubmitting(true);
    setActiveOption(isAnonymous ? 'anonymous' : 'named');

    try {
      const shouldUpload = Boolean(formData.imageFile);
      let imageUrl = null;

      if (shouldUpload && onUploadStateChange) {
        onUploadStateChange(true);
      }

      if (shouldUpload) {
        imageUrl = await uploadImage(formData.imageFile);
      }

      const complaintData = {
        space_id: spaceId,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        is_anonymous: isAnonymous,
        student_name: isAnonymous ? null : formData.name || null,
        student_email: isAnonymous ? null : formData.email || null,
        image_url: imageUrl,
      };

      const response = await createComplaint(complaintData);
      toast.success('Issue raised!');
      if (onSuccess) onSuccess(response.data);
      if (onClose) onClose();
    } catch (error) {
      console.error('Failed to submit complaint:', error);
      toast.error('Failed to submit. Try again.');
    } finally {
      if (onUploadStateChange) {
        onUploadStateChange(false);
      }
      setIsSubmitting(false);
      setActiveOption(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={isSubmitting ? undefined : onBack}
      />

      <div
        className={`relative z-10 w-full max-w-[320px] rounded-[20px] bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.14)] transform-gpu will-change-transform ${
          isVisible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
        }`}
        style={{
          transition: 'transform 160ms ease-out, opacity 160ms ease-out',
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Anonymous submission confirmation"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-primary">How do you want to submit?</h3>
            <p className="mt-1 text-sm text-secondary">Choose who should see your identity.</p>
          </div>
          <button
            onClick={isSubmitting ? undefined : onBack}
            className="rounded-full p-1.5 transition-colors hover:bg-gray-100"
            aria-label="Close confirmation"
          >
            <X size={18} className="text-secondary" />
          </button>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => handleSubmit(true)}
            disabled={isSubmitting}
            className={`flex w-full items-start gap-3 rounded-2xl border px-4 py-4 text-left transition-all ${
              isSubmitting && activeOption !== 'anonymous'
                ? 'cursor-not-allowed opacity-60'
                : 'border-gray-200 hover:border-accent-dept hover:bg-accent-dept/5'
            }`}
          >
            <div className="mt-0.5 rounded-xl bg-gray-100 p-2.5">
              {isSubmitting && activeOption === 'anonymous' ? (
                <Loader2 size={18} className="animate-spin text-accent-dept" />
              ) : (
                <EyeOff size={18} className="text-secondary" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-primary">Submit Anonymously</h4>
                {isSubmitting && activeOption === 'anonymous' && (
                  <span className="text-xs font-medium text-secondary">Submitting...</span>
                )}
              </div>
              <p className="mt-1 text-sm text-secondary">Your name stays hidden from everyone</p>
            </div>
          </button>

          <button
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
            className={`flex w-full items-start gap-3 rounded-2xl border px-4 py-4 text-left transition-all ${
              isSubmitting && activeOption !== 'named'
                ? 'cursor-not-allowed opacity-60'
                : 'border-gray-200 hover:border-accent-dept hover:bg-accent-dept/5'
            }`}
          >
            <div className="mt-0.5 rounded-xl bg-gray-100 p-2.5">
              {isSubmitting && activeOption === 'named' ? (
                <Loader2 size={18} className="animate-spin text-accent-dept" />
              ) : (
                <User size={18} className="text-secondary" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-primary">Submit with My Name</h4>
              </div>
              <p className="mt-1 text-sm text-secondary">Visible to staff and admin</p>
            </div>
          </button>
        </div>

        <button
          onClick={isSubmitting ? undefined : onBack}
          className="mt-4 w-full text-center text-sm font-medium text-secondary transition-colors hover:text-primary"
        >
          Go back
        </button>
      </div>
    </div>
  );
};

export default AnonymousConfirm;
