import React, { useState } from 'react';
import Image from 'next/image';
import { X, Plus, ShieldCheck, CheckCircle2, Shield, ChevronDown, Check, ChevronRight, Activity } from 'lucide-react';
import PricingAvailabilityStep from '@/components/PricingAvailabilityStep';

const CATEGORY_GROUPS = [
  {
    label: 'Academic',
    items: ['Books', 'Notes', 'Stationery'],
  },
  {
    label: 'Electronics',
    items: ['Laptops', 'Mobiles', 'Accessories', 'Audio'],
  },
  {
    label: 'Furniture',
    items: ['Table', 'Chair', 'Bed', 'Storage', 'Lamps'],
  },
  {
    label: 'Clothing',
    items: ['Wear', 'Shoes', 'Bags', 'Accessories'],
  },
  {
    label: 'Transport',
    items: ['Cycle', 'Scooter', 'Travel', 'Safety Gear'],
  },
  {
    label: 'Entertainment',
    items: ['Gaming', 'Music', 'Sports'],
  },
  {
    label: 'Services',
    items: ['Room/PG', 'Food', 'Laundry', 'Repair'],
  },
  {
    label: 'Projects',
    items: ['Arduino', 'Robotics', 'Lab Tools'],
  },
  {
    label: 'Events',
    items: ['Decor', 'Lights', 'Speakers'],
  },
  {
    label: 'Others',
    items: ['Others'],
  },
];

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step1Errors = {
  title?: string;
  description?: string;
  category?: string;
};

export default function CreateListingModal({ isOpen, onClose }: CreateListingModalProps) {
  const [step, setStep] = useState(1);
  const [isClosing, setIsClosing] = useState(false);
  
  // Data States
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Books');
  const [itemTitle, setItemTitle] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [step1Errors, setStep1Errors] = useState<Step1Errors>({});

  if (!isOpen) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setStep(1);
      onClose();
    }, 200);
  };

  const handleNext = () => {
    if (step === 1) {
      const nextErrors: Step1Errors = {};
      if (!itemTitle.trim()) {
        nextErrors.title = 'Title is required.';
      }
      if (!itemDescription.trim()) {
        nextErrors.description = 'Description is required.';
      }
      if (!selectedCategory.trim()) {
        nextErrors.category = 'Category is required.';
      }

      setStep1Errors(nextErrors);
      if (Object.keys(nextErrors).length > 0) {
        return;
      }
    }

    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = 5 - imageUrls.length;
    if (remainingSlots <= 0) {
      setUploadMessage('You can upload up to 5 photos only.');
      e.target.value = '';
      return;
    }

    const filesToUpload = files.slice(0, remainingSlots);
    if (files.length > remainingSlots) {
      setUploadMessage(`Only ${remainingSlots} photo slots left. Extra files were ignored.`);
    } else {
      setUploadMessage(null);
    }

    setIsUploading(true);
    try {
      const uploadResults = await Promise.allSettled(
        filesToUpload.map(async (file) => {
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
          return data.url as string;
        })
      );

      const successfulUploads = uploadResults
        .filter((result): result is PromiseFulfilledResult<string> => result.status === 'fulfilled')
        .map((result) => result.value);

      const failedUploads = uploadResults.filter((result) => result.status === 'rejected');

      if (successfulUploads.length > 0) {
        setImageUrls((prev) => [...prev, ...successfulUploads]);
      }

      if (failedUploads.length > 0) {
        const firstError = failedUploads[0] as PromiseRejectedResult;
        const reason =
          firstError.reason instanceof Error
            ? firstError.reason.message
            : 'Some images failed to upload.';
        setUploadMessage(reason);
      } else {
        setUploadMessage(`${successfulUploads.length} photo uploaded successfully.`);
      }
    } catch (error) {
      console.error('Upload failed', error);
      setUploadMessage('Image upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, idx) => idx !== index));
    setUploadMessage(null);
  };

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-200 ${isClosing ? 'opacity-0' : 'opacity-100'}`}>
      
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#1c2b4c]/40 backdrop-blur-sm"
        onClick={handleClose}
      ></div>

      {/* Modal Container */}
      <div className={`relative bg-[#f8fafe] w-full max-w-[800px] rounded-xl shadow-2xl overflow-hidden flex flex-col transform transition-transform duration-200 ${isClosing ? 'scale-95' : 'scale-100'}`}>
        
        {/* Modal Header */}
        <div className="bg-white px-6 py-4 border-b border-slate-200 flex justify-between items-start">
          <div>
            <h2 className="text-[20px] font-bold text-[#1c2b4c]">List Item for Rent</h2>
            <p className="text-sm text-slate-500 mt-1">
              {step === 1 ? 'Reach nearby students by listing your item' : 
               step === 2 ? 'Set availability and optimal pricing for your item' : 
               'Review and publish your listing'}
            </p>
          </div>
          <button 
            onClick={handleClose}
            className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto bg-[#f8fafe]">
          
          {step === 1 && (
            <div className="flex flex-col md:flex-row p-6 gap-8">
              
              {/* Step 1 Left Column */}
              <div className="w-full md:w-[35%] flex flex-col gap-5">
                
                <div>
                  <h3 className="text-[15px] font-bold text-[#1c2b4c] mb-3">Upload Photos</h3>
                  <label className="border-2 border-dashed border-slate-300 bg-white rounded-xl min-h-36 p-3 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-[#1b52d6] transition-colors relative overflow-hidden block w-full">
                     <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageUpload} />
                     {isUploading ? (
                        <div className="flex flex-col items-center py-5">
                          <Activity className="w-8 h-8 text-[#1b52d6] mb-2 animate-spin" />
                          <span className="text-sm font-bold text-slate-500">Uploading photos...</span>
                        </div>
                     ) : imageUrls.length > 0 ? (
                        <div className="w-full">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-xs font-semibold text-[#1c2b4c]">Uploaded {imageUrls.length}/5</span>
                            <span className="text-[11px] text-slate-500">Tap to add more</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {imageUrls.map((url, index) => (
                              <div key={`${url}-${index}`} className="relative h-16 overflow-hidden rounded-md border border-slate-200">
                                <Image src={url} alt={`Uploaded ${index + 1}`} fill sizes="64px" className="object-cover" />
                                {index === 0 && (
                                  <span className="absolute left-1 top-1 rounded bg-[#1b52d6] px-1 py-0.5 text-[9px] font-semibold text-white">
                                    Thumbnail
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.preventDefault();
                                    removeImage(index);
                                  }}
                                  className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-black/55 text-[10px] text-white"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                     ) : (
                        <div className="flex flex-col items-center py-5">
                          <Plus className="w-8 h-8 text-[#1b52d6] mb-2" strokeWidth={2.5} />
                          <span className="text-sm font-bold text-[#1b52d6]">Upload Photos</span>
                          <span className="text-[11px] text-slate-500 mt-0.5">Select up to 5 images</span>
                        </div>
                     )}
                  </label>
                  <p className="text-[12px] text-slate-500 mt-3 flex items-start gap-1">
                    <Check className="w-3.5 h-3.5 mt-[1px] text-slate-400 flex-shrink-0" />
                    Upload up to 5 photos. First photo will be the thumbnail.
                  </p>
                  {uploadMessage && (
                    <p className="text-[12px] text-[#1c2b4c] mt-1">{uploadMessage}</p>
                  )}
                </div>

                <div>
                  <h3 className="text-[15px] font-bold text-[#1b52d6] mb-3">Personal Verification</h3>
                  <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
                    <div className="bg-[#eaf8f4] p-2.5 rounded-full border border-[#a7d9c8]">
                      <ShieldCheck className="w-7 h-7 text-[#219653]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[14px] text-[#1c2b4c] tracking-wide">AADHAAR VERIFIED</h4>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[#219653]">
                        <CheckCircle2 className="w-4 h-4 fill-current text-white border-none" strokeWidth={1} style={{ background: '#219653', borderRadius: '50%' }} />
                        <span className="text-[12px] font-medium text-slate-600">1234 5628-9576</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 shadow-sm pb-5 relative">
                   <div className="absolute left-0 top-[20%] w-[4px] h-8 bg-[#1b52d6] rounded-r-md"></div>
                   <div className="bg-[#1b52d6] text-white p-1 rounded-md ml-1">
                     <Check className="w-4 h-4" strokeWidth={3} />
                   </div>
                   <div>
                     <h4 className="font-bold text-[15px] text-[#1c2b4c] mb-0.5">Rent Verification</h4>
                     <div className="flex items-center gap-1">
                       <Shield className="w-3.5 h-3.5 text-[#1b52d6]" />
                       <span className="text-[13px] text-[#1b52d6] font-medium">Request</span>
                     </div>
                   </div>
                </div>

              </div>

              {/* Step 1 Right Column */}
              <div className="w-full md:w-[65%] flex flex-col gap-4">
                
                <div>
                  <label className="block text-[14px] font-medium text-[#1c2b4c] mb-1.5">Title</label>
                  <input 
                    type="text" 
                    placeholder="E.g. Scientific Calculator" 
                    value={itemTitle}
                    onChange={(event) => {
                      setItemTitle(event.target.value);
                      if (step1Errors.title) {
                        setStep1Errors((prev) => ({ ...prev, title: undefined }));
                      }
                    }}
                    className="w-full bg-white border border-slate-200 rounded-md px-3 py-2.5 text-sm text-[#1c2b4c] outline-none focus:border-[#1b52d6]"
                  />
                  {step1Errors.title && <p className="mt-1 text-xs text-rose-600">{step1Errors.title}</p>}
                </div>

                <div>
                  <label className="block text-[14px] font-medium text-[#1c2b4c] mb-1.5">Description</label>
                  <textarea 
                    placeholder="Describe the item&apos;s features" 
                    rows={2}
                    value={itemDescription}
                    onChange={(event) => {
                      setItemDescription(event.target.value);
                      if (step1Errors.description) {
                        setStep1Errors((prev) => ({ ...prev, description: undefined }));
                      }
                    }}
                    className="w-full bg-[#f6f8fb] border border-slate-200 rounded-md px-3 py-2.5 text-sm text-[#1c2b4c] outline-none focus:bg-white focus:border-[#1b52d6] resize-none"
                  ></textarea>
                  {step1Errors.description && <p className="mt-1 text-xs text-rose-600">{step1Errors.description}</p>}
                </div>

                <div>
                  <label className="block text-[14px] font-medium text-[#1c2b4c] mb-1.5">Category</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsCategoryOpen((prev) => !prev)}
                      className="w-full bg-[#f6f8fb] border border-slate-200 rounded-md px-3 py-2.5 text-sm text-[#1c2b4c] text-left outline-none focus:bg-white focus:border-[#1b52d6] cursor-pointer flex items-center justify-between"
                    >
                      <span>{selectedCategory}</span>
                      <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isCategoryOpen && (
                      <div className="absolute top-full left-0 right-0 z-30 mt-1 rounded-md border border-slate-200 bg-white shadow-lg">
                        <div className="max-h-[170px] overflow-y-auto py-1">
                          {CATEGORY_GROUPS.map((group) => (
                            <div key={group.label}>
                              <p className="px-3 py-1 text-[12px] font-semibold text-slate-500 bg-slate-50">
                                {group.label}
                              </p>
                              {group.items.map((item) => (
                                <button
                                  key={`${group.label}-${item}`}
                                  type="button"
                                  onClick={() => {
                                    setSelectedCategory(item);
                                    setIsCategoryOpen(false);
                                    if (step1Errors.category) {
                                      setStep1Errors((prev) => ({ ...prev, category: undefined }));
                                    }
                                  }}
                                  className={`w-full px-3 py-2 text-left text-sm hover:bg-blue-50 ${selectedCategory === item ? 'bg-blue-100 text-[#1b52d6] font-medium' : 'text-[#1c2b4c]'}`}
                                >
                                  {item}
                                </button>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {step1Errors.category && <p className="mt-1 text-xs text-rose-600">{step1Errors.category}</p>}
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-[14px] font-medium text-[#1c2b4c] mb-1.5">Rent Price</label>
                    <div className="relative flex items-center bg-[#f6f8fb] border border-slate-200 rounded-md focus-within:bg-white focus-within:border-[#1b52d6]">
                      <span className="pl-3 text-[#1c2b4c] font-medium">₹</span>
                      <input type="text" className="w-full bg-transparent px-2 py-2.5 text-sm outline-none text-[#1c2b4c] pr-12" />
                      <span className="absolute right-3 text-sm text-slate-400">/day</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-[14px] font-medium text-[#1c2b4c] mb-1.5">Deposit <span className="text-slate-500 font-normal">(Refundable)</span></label>
                    <div className="relative flex items-center bg-[#f6f8fb] border border-slate-200 rounded-md focus-within:bg-white focus-within:border-[#1b52d6]">
                      <span className="pl-3 text-[#1c2b4c] font-medium">₹</span>
                      <input type="text" className="w-full bg-transparent px-2 py-2.5 text-sm outline-none text-[#1c2b4c]" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <div className="w-4 h-4 rounded border border-slate-300 bg-white flex items-center justify-center"></div>
                  <span className="text-[14px] text-slate-600">Negotiable</span>
                </div>

                <button 
                  onClick={handleNext}
                  className="w-full bg-[#1b52d6] text-white py-3 rounded-md font-bold mt-2 shadow-sm shadow-blue-500/20 hover:bg-[#103387] flex justify-center items-center gap-1 transition-colors"
                >
                  Next <ChevronRight className="w-5 h-5" />
                </button>

                <p className="text-center text-[13px] text-slate-500 mt-1">
                  Need tips? Check <span className="text-[#1b52d6] cursor-pointer hover:underline">Rental Guidelines</span>
                </p>

              </div>
            </div>
          )}

          {step === 2 && (
            <PricingAvailabilityStep
              onBack={handleBack}
              onSuccess={handleNext}
              listingDraft={{
                title: itemTitle,
                description: itemDescription,
                category: selectedCategory,
                image_urls: imageUrls,
              }}
            />
          )}

          {step === 3 && (
            <div className="p-10 flex flex-col items-center justify-center min-h-[400px]">
               <div className="w-20 h-20 bg-[#eaf8f4] rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-lg">
                 <CheckCircle2 className="w-12 h-12 text-[#219653] fill-current" stroke="white" strokeWidth={1} />
               </div>
               <h2 className="text-2xl font-bold text-[#1c2b4c] mb-2 text-center">Listing Published!</h2>
               <p className="text-slate-500 text-center mb-8 max-w-md">Your Scientific Calculator has been successfully listed. Nearby students can now see it and send rental requests.</p>
               
               <div className="flex gap-4 w-full max-w-sm">
                 <button 
                  onClick={handleClose}
                  className="flex-1 bg-white border border-slate-300 text-[#1c2b4c] py-3 rounded-md font-bold hover:bg-slate-50 transition-colors"
                 >
                   View Listing
                 </button>
                 <button 
                  onClick={handleClose}
                  className="flex-1 bg-[#1b52d6] text-white py-3 rounded-md font-bold shadow-sm shadow-blue-500/20 hover:bg-[#103387] transition-colors"
                 >
                   Done
                 </button>
               </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
