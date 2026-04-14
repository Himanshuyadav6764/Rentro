"use client";

import React from 'react';
import {
  User,
  Edit2,
  Smartphone,
  Mail,
  Clock,
  Star,
  Check,
  X,
  Camera
} from 'lucide-react';
import Image from 'next/image';
import { getDownloadURL, ref, uploadBytes, getStorage } from 'firebase/storage';
import { getFirebaseClientAuth } from '@/lib/firebase-client';

interface ProfileViewProps {
  currentUser?: {
    name?: string;
    email?: string;
    phone?: string;
    image?: string;
    providers?: string[];
  } | null;
  onProfileUpdated?: (nextUser: {
    name?: string;
    email?: string;
    phone?: string;
    image?: string;
    providers?: string[];
  }) => void;
}

type EditableProfile = {
  name: string;
  email: string;
  phone: string;
  avatar: string;
};

function fallbackName(email?: string, phone?: string) {
  if (email) {
    return email.split("@")[0] || "Rentro User";
  }

  if (phone) {
    return `User-${phone.slice(-4)}`;
  }

  return "Rentro User";
}

function toEditableProfile(user?: ProfileViewProps["currentUser"]): EditableProfile {
  const safeUser = user || null;
  return {
    name: safeUser?.name || fallbackName(safeUser?.email, safeUser?.phone),
    email: safeUser?.email || "Not added",
    phone: safeUser?.phone || "Not added",
    avatar: safeUser?.image || "/shekhar-avatar.png",
  };
}

function getPrimaryProvider(providers?: string[]): "google" | "email" | "phone" | "unknown" {
  if (!providers || providers.length === 0) {
    return "unknown";
  }

  if (providers.includes("google")) {
    return "google";
  }

  if (providers.includes("email")) {
    return "email";
  }

  if (providers.includes("phone")) {
    return "phone";
  }

  return "unknown";
}

export default function ProfileView({ currentUser, onProfileUpdated }: ProfileViewProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [profile, setProfile] = React.useState<EditableProfile>(() =>
    toEditableProfile(currentUser),
  );
  const [isPhotoMenuOpen, setIsPhotoMenuOpen] = React.useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = React.useState(false);
  const [photoMessage, setPhotoMessage] = React.useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = React.useState(false);
  const [cameraStream, setCameraStream] = React.useState<MediaStream | null>(null);
  const [isSavingProfile, setIsSavingProfile] = React.useState(false);

  const [tempProfile, setTempProfile] = React.useState({ ...profile });
  const galleryInputRef = React.useRef<HTMLInputElement | null>(null);
  const cameraInputRef = React.useRef<HTMLInputElement | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  const provider = React.useMemo(
    () => getPrimaryProvider(currentUser?.providers),
    [currentUser?.providers],
  );

  React.useEffect(() => {
    if (isEditing || isSavingProfile) {
      return;
    }

    const nextProfile = toEditableProfile(currentUser);
    setProfile(nextProfile);
    setTempProfile(nextProfile);
  }, [currentUser, isEditing, isSavingProfile]);

  React.useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream]);

  React.useEffect(() => {
    return () => {
      cameraStream?.getTracks().forEach((track) => track.stop());
    };
  }, [cameraStream]);

  const handleSave = async () => {
    setIsSavingProfile(true);
    setPhotoMessage(null);

    const payload = {
      name: tempProfile.name.trim() || profile.name,
      email: tempProfile.email === 'Not added' ? '' : tempProfile.email.trim().toLowerCase(),
      phone: tempProfile.phone === 'Not added' ? '' : tempProfile.phone.trim(),
      image: tempProfile.avatar,
    };

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as {
        success?: boolean;
        user?: {
          name?: string;
          email?: string;
          phone?: string;
          image?: string;
          providers?: string[];
        };
        message?: string;
      };

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Profile save failed');
      }

      const nextProfile = {
        name: data.user?.name || payload.name,
        email: data.user?.email || (payload.email || 'Not added'),
        phone: data.user?.phone || (payload.phone || 'Not added'),
        avatar: data.user?.image || payload.image || profile.avatar,
      };

      setProfile(nextProfile);
      setTempProfile(nextProfile);
      onProfileUpdated?.({
        name: data.user?.name || payload.name,
        email: data.user?.email || payload.email || undefined,
        phone: data.user?.phone || payload.phone || undefined,
        image: data.user?.image || payload.image,
        providers: data.user?.providers,
      });

      setIsPhotoMenuOpen(false);
      setIsEditing(false);
    } catch (error) {
      const localFallbackProfile = {
        name: payload.name,
        email: payload.email || 'Not added',
        phone: payload.phone || 'Not added',
        avatar: payload.image || profile.avatar,
      };

      setProfile(localFallbackProfile);
      setTempProfile(localFallbackProfile);
      onProfileUpdated?.({
        name: payload.name,
        email: payload.email || undefined,
        phone: payload.phone || undefined,
        image: payload.image || undefined,
      });
      setIsEditing(false);
      setPhotoMessage(
        error instanceof Error ? error.message : 'Profile save failed. Please try again.',
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleEditClick = () => {
    setTempProfile({ ...profile });
    setIsPhotoMenuOpen(false);
    setPhotoMessage(null);
    setIsEditing(true);
  };

  const stopCamera = React.useCallback(() => {
    cameraStream?.getTracks().forEach((track) => track.stop());
    setCameraStream(null);
  }, [cameraStream]);

  const closeCameraModal = React.useCallback(() => {
    stopCamera();
    setIsCameraOpen(false);
  }, [stopCamera]);

  const uploadAvatar = React.useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setPhotoMessage('Please select a valid image file.');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setPhotoMessage('Image size 8MB se kam rakho.');
      return;
    }

    setIsUploadingPhoto(true);
    setPhotoMessage(null);

    try {
      let uploadedUrl: string | null = null;

      try {
        const auth = getFirebaseClientAuth();
        const storage = getStorage(auth.app);
        const safeIdentity =
          (currentUser?.email || currentUser?.phone || 'guest')
            .replace(/[^a-zA-Z0-9_-]/g, '_')
            .slice(0, 64) || 'guest';
        const extension = file.name.split('.').pop() || 'jpg';
        const fileRef = ref(
          storage,
          `profile-avatars/${safeIdentity}/${Date.now()}.${extension}`,
        );

        await uploadBytes(fileRef, file, {
          contentType: file.type,
        });
        uploadedUrl = await getDownloadURL(fileRef);
      } catch {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        if (!response.ok || !data.url) {
          throw new Error(data.error || 'Upload failed');
        }

        uploadedUrl = data.url as string;
      }

      setTempProfile((prev) => ({ ...prev, avatar: uploadedUrl || prev.avatar }));
      setPhotoMessage('Photo uploaded. Save Changes dabao to apply.');
      setIsPhotoMenuOpen(false);
    } catch (error) {
      setPhotoMessage(
        error instanceof Error ? error.message : 'Image upload failed. Please try again.',
      );
    } finally {
      setIsUploadingPhoto(false);
    }
  }, [currentUser?.email, currentUser?.phone]);

  const handleGallerySelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await uploadAvatar(file);
    }
    event.target.value = '';
  };

  const openCamera = async () => {
    setPhotoMessage(null);
    setIsPhotoMenuOpen(false);

    if (!navigator.mediaDevices?.getUserMedia) {
      cameraInputRef.current?.click();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
        },
      });
      setCameraStream(stream);
      setIsCameraOpen(true);
    } catch {
      cameraInputRef.current?.click();
    }
  };

  const captureAndUploadFromCamera = async () => {
    if (!videoRef.current) {
      return;
    }

    const width = videoRef.current.videoWidth;
    const height = videoRef.current.videoHeight;
    if (!width || !height) {
      setPhotoMessage('Camera ready nahi hai. Ek bar phir try karo.');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');

    if (!context) {
      setPhotoMessage('Camera capture unsupported hai is browser me.');
      return;
    }

    context.drawImage(videoRef.current, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', 0.92);
    });

    if (!blob) {
      setPhotoMessage('Image capture failed. Please try again.');
      return;
    }

    const file = new File([blob], `avatar-${Date.now()}.jpg`, {
      type: 'image/jpeg',
    });

    await uploadAvatar(file);
    closeCameraModal();
  };

  const handleCapturedFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await uploadAvatar(file);
    }
    event.target.value = '';
  };

  return (
    <div className="w-full bg-[#f8faff] flex flex-col font-sans max-w-md md:max-w-3xl mx-auto h-full overflow-y-auto hide-scrollbar pb-32 animate-in fade-in duration-500 relative">

      {/* Background soft gradient overlay */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none"></div>

      {/* Modern Centered Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
          {/* Backdrop Blur */}
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            onClick={() => setIsEditing(false)}
          ></div>

          <div className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-400">
            <header className="px-8 py-6 flex items-center justify-between border-b border-slate-50 bg-white z-10">
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Profile Settings</h3>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Update your personal information</p>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-all"
              >
                <X size={20} strokeWidth={3} />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth hide-scrollbar">

              {/* Avatar Section */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-4 border-slate-50 shadow-lg">
                    <Image src={tempProfile.avatar} alt="Avatar Preview" width={96} height={96} className="object-cover" />
                  </div>
                  <button
                    onClick={() => setIsPhotoMenuOpen((prev) => !prev)}
                    className="absolute -bottom-1 -right-1 bg-brand text-white p-2 rounded-xl shadow-lg hover:scale-110 active:scale-95 transition-all border-4 border-white"
                    type="button"
                  >
                    <Camera size={14} strokeWidth={3} />
                  </button>

                  {isPhotoMenuOpen ? (
                    <div className="absolute top-[105%] left-1/2 -translate-x-1/2 z-20 bg-white border border-slate-200 shadow-xl rounded-2xl p-2 w-52">
                      <button
                        type="button"
                        onClick={() => galleryInputRef.current?.click()}
                        className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-50 text-sm font-semibold text-slate-700"
                      >
                        Choose From Gallery
                      </button>
                      <button
                        type="button"
                        onClick={() => void openCamera()}
                        className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-50 text-sm font-semibold text-slate-700"
                      >
                        Open Camera & Capture
                      </button>
                    </div>
                  ) : null}
                </div>
                <span className="text-[10px] font-black text-brand uppercase tracking-widest">Change Photo</span>
                {isUploadingPhoto ? (
                  <p className="text-xs font-semibold text-slate-500">Uploading photo...</p>
                ) : null}
                {photoMessage ? (
                  <p className="text-xs font-semibold text-slate-500 text-center max-w-xs">{photoMessage}</p>
                ) : null}

                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleGallerySelect}
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleCapturedFileSelect}
                />
              </div>

              {/* Form Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <EditField label="Full Name" value={tempProfile.name} onChange={(v) => setTempProfile({ ...tempProfile, name: v })} icon={<User size={16} />} />
                <EditField label="Phone" value={tempProfile.phone} onChange={(v) => setTempProfile({ ...tempProfile, phone: v })} icon={<Smartphone size={16} />} />
              </div>

              <EditField label="Email Address" value={tempProfile.email} onChange={(v) => setTempProfile({ ...tempProfile, email: v })} icon={<Mail size={16} />} />
            </div>

            <footer className="px-8 py-6 border-t border-slate-50 bg-slate-50/50 backdrop-blur-sm flex items-center gap-4">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-all text-sm uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSavingProfile}
                className="flex-[2] bg-brand text-white py-4 rounded-2xl font-black shadow-xl shadow-brand/30 hover:scale-[1.02] active:scale-95 transition-all text-sm uppercase tracking-widest"
              >
                {isSavingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* Profile Header Section */}
      <div className="relative pt-12 pb-4 text-center px-6">
        <div className="relative w-32 h-32 mx-auto mb-6">
          <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-[0_10px_30px_rgba(0,0,0,0.08)] relative">
            <Image
              src={profile.avatar}
              alt={profile.name}
              width={128}
              height={128}
              className="object-cover"
            />
          </div>
          <button
            onClick={handleEditClick}
            className="absolute bottom-1 right-1 bg-brand text-white p-2.5 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all border-4 border-white"
          >
            <Edit2 size={16} />
          </button>
        </div>

        <h2 className="text-2xl font-bold text-[#1e293b] tracking-tight">{profile.name}</h2>
        <p className="text-slate-400 text-[13px] font-medium mt-1">Member since Nov 2025</p>
      </div>

      {/* Badges & Stats Row */}
      <div className="flex flex-col items-center gap-4 px-6 mb-8">
        <div className="flex gap-2">
          <div className="flex items-center gap-1.5 bg-[#4caf50] text-white px-3.5 py-1.5 rounded-full shadow-sm">
            <Star size={14} className="fill-white" />
            <span className="font-bold text-[13px]">Trust: 90</span>
          </div>
          <div className="flex items-center gap-1.5 bg-blue-50 text-[#3b82f6] px-3.5 py-1.5 rounded-full border border-blue-100 shadow-sm">
            <div className="bg-[#3b82f6] text-white rounded-full p-0.5"><Check size={10} strokeWidth={4} /></div>
            <span className="font-bold text-[13px]">Verified</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-slate-500 font-bold text-[14px]">
          <span>0 <span className="font-medium text-slate-400">Followers</span></span>
          <div className="w-[1px] h-3 bg-slate-200"></div>
          <span>0 <span className="font-medium text-slate-400">Following</span></span>
        </div>
      </div>

      {/* Login Provider Section */}
      <div className="flex items-center justify-center gap-2 mb-8 text-slate-500">
        <span className="text-[13px] font-medium">User logged in with</span>
        {provider === "google" ? (
          <div className="flex items-center gap-1.5 font-bold text-[14px] text-slate-700">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </div>
        ) : null}
        {provider === "email" ? (
          <div className="flex items-center gap-1.5 font-bold text-[14px] text-slate-700">
            <Mail size={14} />
            Email Link
          </div>
        ) : null}
        {provider === "phone" ? (
          <div className="flex items-center gap-1.5 font-bold text-[14px] text-slate-700">
            <Smartphone size={14} />
            Phone
          </div>
        ) : null}
        {provider === "unknown" ? (
          <div className="flex items-center gap-1.5 font-bold text-[14px] text-slate-700">
            <User size={14} />
            Account
          </div>
        ) : null}
      </div>

      {/* Details Section */}
      <div className="px-6 flex flex-col gap-3 mb-10">
        <DetailCard icon={<User size={18} />} value={profile.name} label="Full Name" />
        <DetailCard icon={<Mail size={18} />} value={profile.email} label="Email Address" />
        <DetailCard icon={<Smartphone size={18} />} value={profile.phone} label="Phone Number" />
      </div>

      {/* AI Trust Section */}
      <div className="px-6 mb-12">
        <h4 className="text-[14px] font-bold text-slate-800 mb-4 px-1">AI Trust & Behavior</h4>
        <div className="bg-white rounded-[24px] p-6 shadow-[0_8px_20px_rgba(0,0,0,0.04)] border border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-emerald-500 rounded-lg p-1 text-white">
              <Check size={16} strokeWidth={4} />
            </div>
            <span className="text-[15px] font-bold text-slate-700">Trust Score  90</span>
            <div className="ml-auto flex gap-1">
              <div className="w-2.5 h-2.5 bg-blue-400/20 rounded-full"></div>
              <div className="w-2.5 h-2.5 bg-blue-400/30 rounded-full"></div>
            </div>
          </div>

          <div className="w-full h-[6px] bg-slate-50 rounded-full mb-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 h-full bg-[#4caf50] rounded-full w-[90%]"></div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-50 pt-5">
            <div className="flex items-center gap-2 text-slate-500">
              <Clock size={16} />
              <span className="text-[13px] font-medium">Return History: <span className="text-slate-700 font-bold">On-time 95%</span></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-medium text-slate-500">Risk Level: <span className="text-[#219653] font-bold">Low</span></span>
              <div className="bg-[#4caf50] rounded-full p-0.5 text-white">
                <Check size={10} strokeWidth={4} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {isCameraOpen ? (
        <div className="fixed inset-0 z-[1100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-black text-slate-800">Capture Photo</h4>
              <button
                type="button"
                onClick={closeCameraModal}
                className="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-800"
              >
                <X size={18} className="mx-auto" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden bg-slate-950">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full aspect-[3/4] object-cover"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={closeCameraModal}
                className="py-3 rounded-2xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void captureAndUploadFromCamera()}
                className="py-3 rounded-2xl font-black text-white bg-brand hover:opacity-95 transition-opacity"
              >
                Capture
              </button>
            </div>
          </div>
        </div>
      ) : null}

    </div>
  );
}

function DetailCard({ icon, value, label }: { icon: React.ReactNode, value: string, label: string }) {
  return (
    <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_4px_10px_rgba(0,0,0,0.02)] group hover:border-brand/40 transition-all cursor-pointer overflow-hidden">
      <div className="w-12 h-12 flex items-center justify-center bg-[#f0f4f8] rounded-xl text-slate-500 group-hover:text-brand bg-gradient-to-br from-slate-50 to-slate-100 group-hover:from-blue-50 group-hover:to-blue-100 transition-all shrink-0">
        {icon}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
        <span className="text-[15px] font-bold text-slate-700 group-hover:text-slate-900 transition-colors truncate">{value}</span>
      </div>
    </div>
  );
}

function EditField({ label, value, onChange, icon }: { label: string, value: string, onChange: (v: string) => void, icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 scale-in animate-in duration-300">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative flex items-center group">
        {icon && <div className="absolute left-4 text-slate-300 group-focus-within:text-brand transition-colors">{icon}</div>}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-slate-50 border border-slate-100 p-4 ${icon ? 'pl-11' : 'pl-4'} rounded-2xl font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 ring-brand/5 focus:border-brand/30 transition-all`}
        />
      </div>
    </div>
  );
}
