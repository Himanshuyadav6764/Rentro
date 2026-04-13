import React, { useState } from 'react';
import { X, Plus, ShieldCheck, CheckCircle2, Shield, ChevronDown, Check, ChevronRight, Activity, Zap, Info } from 'lucide-react';

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateListingModal({ isOpen, onClose }: CreateListingModalProps) {
  const [step, setStep] = useState(1);
  const [isClosing, setIsClosing] = useState(false);

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
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
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
                  <div className="border-2 border-dashed border-slate-300 bg-white rounded-xl h-36 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-[#1b52d6] transition-colors">
                     <Plus className="w-8 h-8 text-[#1b52d6] mb-2" strokeWidth={2.5} />
                     <span className="text-sm font-bold text-[#1b52d6]">Upload Photos</span>
                  </div>
                  <p className="text-[12px] text-slate-500 mt-3 flex items-start gap-1">
                    <Check className="w-3.5 h-3.5 mt-[1px] text-slate-400 flex-shrink-0" />
                    Max 5 photos. First photo will be the thumbnail.
                  </p>
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
                    className="w-full bg-white border border-slate-200 rounded-md px-3 py-2.5 text-sm text-[#1c2b4c] outline-none focus:border-[#1b52d6]"
                  />
                </div>

                <div>
                  <label className="block text-[14px] font-medium text-[#1c2b4c] mb-1.5">Description</label>
                  <textarea 
                    placeholder="Describe the item&apos;s features" 
                    rows={2}
                    className="w-full bg-[#f6f8fb] border border-slate-200 rounded-md px-3 py-2.5 text-sm text-[#1c2b4c] outline-none focus:bg-white focus:border-[#1b52d6] resize-none"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-[14px] font-medium text-[#1c2b4c] mb-1.5">Category</label>
                  <div className="relative">
                    <select className="w-full bg-[#f6f8fb] border border-slate-200 rounded-md px-3 py-2.5 text-sm text-[#1c2b4c] outline-none focus:bg-white focus:border-[#1b52d6] appearance-none cursor-pointer">
                      <option>Calculators</option>
                      <option>Books</option>
                      <option>Laptops</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-2.5 w-5 h-5 text-slate-400 pointer-events-none" />
                  </div>
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
            <div className="p-6">
              
              {/* Stepper */}
              <div className="flex items-center gap-3 mb-6 bg-white py-2 px-4 rounded-lg inline-flex shadow-sm border border-slate-100">
                <div className="flex items-center gap-1.5 text-[#219653]">
                  <CheckCircle2 className="w-5 h-5 fill-current text-white border-none" strokeWidth={1} style={{ background: '#219653', borderRadius: '50%' }} />
                  <span className="text-[14px] font-bold">Item Details</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300" />
                <div className="flex items-center gap-1.5 text-[#1b52d6]">
                  <div className="w-5 h-5 rounded-full bg-[#1b52d6] text-white flex items-center justify-center text-xs font-bold">2</div>
                  <span className="text-[14px] font-bold">Pricing & Availability</span>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-8">
                
                {/* Step 2 Left Column */}
                <div className="w-full md:w-[35%] flex flex-col gap-5">
                  <div>
                    <h3 className="text-[15px] font-bold text-[#1c2b4c] mb-3">Availability</h3>
                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                       <div className="grid grid-cols-6 gap-1 mb-3 text-center">
                         <div className="text-[11px] font-medium text-[#1b52d6] bg-blue-50 py-1 rounded">Mon</div>
                         <div className="text-[11px] font-medium text-[#1b52d6] bg-blue-50 py-1 rounded">Tue</div>
                         <div className="text-[11px] font-medium text-[#1b52d6] bg-blue-50 py-1 rounded">Wed</div>
                         <div className="text-[11px] font-medium text-slate-500 py-1">Thu</div>
                         <div className="text-[11px] font-medium text-slate-500 py-1">Fri</div>
                         <div className="text-[11px] font-medium text-slate-500 py-1">Sat</div>
                       </div>
                       <div className="grid grid-cols-6 gap-1 justify-items-center">
                         <div className="w-5 h-5 bg-[#1b52d6] rounded flex items-center justify-center text-white"><Check className="w-3.5 h-3.5" /></div>
                         <div className="w-5 h-5 bg-[#1b52d6] rounded flex items-center justify-center text-white"><Check className="w-3.5 h-3.5" /></div>
                         <div className="w-5 h-5 bg-[#1b52d6] rounded flex items-center justify-center text-white"><Check className="w-3.5 h-3.5" /></div>
                         <div className="w-5 h-5 bg-[#1b52d6] rounded flex items-center justify-center text-white"><Check className="w-3.5 h-3.5" /></div>
                         <div className="w-5 h-5 bg-[#1b52d6] rounded flex items-center justify-center text-white"><Check className="w-3.5 h-3.5" /></div>
                         <div className="w-5 h-5 bg-[#1b52d6] rounded flex items-center justify-center text-white"><Check className="w-3.5 h-3.5" /></div>
                       </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[14px] font-medium text-[#1c2b4c] mb-1.5">From Date</label>
                    <div className="relative">
                      <select className="w-full bg-white border border-slate-200 rounded-md px-3 py-2.5 text-sm text-[#1c2b4c] outline-none appearance-none cursor-pointer">
                        <option>April 15</option>
                        <option>April 16</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-2.5 w-5 h-5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[14px] font-medium text-[#1c2b4c] mb-1.5">Availability Duration</label>
                    <div className="w-full bg-white border border-slate-200 rounded-md px-3 py-2.5 flex justify-between items-center text-sm">
                      <span className="text-slate-400">Choose Date:</span>
                      <span className="text-[#1c2b4c] font-medium">2 days ago</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[14px] font-medium text-[#1c2b4c] mb-1.5">Till Date</label>
                    <div className="relative">
                      <select className="w-full bg-white border border-slate-200 rounded-md px-3 py-2.5 text-sm text-[#1c2b4c] outline-none appearance-none cursor-pointer">
                        <option>April 30</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-2.5 w-5 h-5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <button 
                    onClick={handleBack}
                    className="w-[100px] bg-white border border-slate-300 text-[#1c2b4c] py-2.5 rounded-md font-bold mt-2 hover:bg-slate-50 flex justify-center items-center gap-1 transition-colors relative xl:absolute xl:bottom-6 xl:left-6"
                  >
                    <ChevronRight className="w-5 h-5 transform rotate-180" /> Back
                  </button>

                </div>

                {/* Step 2 Right Column */}
                <div className="w-full md:w-[65%] flex flex-col pt-4">
                  
                  <div className="flex justify-between items-center mb-4">
                     <h3 className="text-[17px] font-bold text-[#1c2b4c]">AI TrustRent Pricing</h3>
                     <div className="flex items-center gap-1 text-slate-500 text-sm">
                       <Activity className="w-4 h-4" /> Reset Condition
                     </div>
                  </div>

                  <div className="bg-[#eaf8f4] border border-[#a7d9c8] rounded-xl p-5 mb-6 relative overflow-hidden">
                     <div className="absolute right-[-10%] top-[-20%] w-[150px] h-[150px] rounded-full bg-[#d0eee4] opacity-40 blur-2xl"></div>
                     <div className="relative z-10">
                       <div className="flex items-start justify-between">
                         <div className="flex gap-3">
                            <div className="bg-[#219653] p-1.5 rounded-lg flex-shrink-0 relative mt-0.5">
                              <ShieldCheck className="w-7 h-7 text-white" />
                              <div className="absolute -bottom-1 -right-1 bg-[#1b52d6] w-4 h-4 rounded-full flex items-center justify-center border border-white">
                                <Zap className="w-2.5 h-2.5 fill-current text-white" />
                              </div>
                            </div>
                            <div>
                               <p className="text-[15px] text-[#1c2b4c] font-medium leading-snug">
                                 AI suggests set price at <span className="font-bold">₹ 10 /day</span><br/> to rent out <span className="text-[#219653] font-bold">30% faster!</span>
                               </p>
                            </div>
                         </div>
                         <div className="bg-[#1b7d44] text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm relative">
                           CONFIDENCE<br/>HIGH
                         </div>
                       </div>
                       
                       <div className="mt-4 flex justify-center">
                         <button className="bg-[#1b52d6] text-white px-8 py-2.5 rounded-md font-bold shadow-sm shadow-blue-500/20 hover:bg-[#103387] w-[60%] sm:w-[50%]">
                           Apply Suggestion
                         </button>
                       </div>
                     </div>
                  </div>

                  <div className="flex justify-between mb-2">
                    <div className="w-[45%]">
                      <label className="block text-[14px] font-medium text-[#1c2b4c] mb-1.5">Rent Price</label>
                      <div className="relative flex items-center bg-white border border-slate-200 rounded-md">
                        <span className="pl-3 text-[#1c2b4c] font-medium">₹</span>
                        <input type="text" value="5 /day" readOnly className="w-full bg-transparent px-2 py-2.5 text-sm outline-none text-[#1c2b4c] text-center" />
                      </div>
                    </div>
                    <div className="w-[45%]">
                      <label className="block text-[14px] font-medium text-[#1c2b4c] mb-1.5">Deposit Amount</label>
                      <div className="relative flex items-center bg-white border border-slate-200 rounded-md">
                        <span className="pl-3 text-[#1c2b4c] font-medium">₹</span>
                        <input type="text" value="200" readOnly className="w-full bg-transparent px-2 py-2.5 text-sm outline-none text-[#1c2b4c] text-center" />
                      </div>
                    </div>
                  </div>

                  {/* Range Slider Visualization */}
                  <div className="mt-6 mb-3 relative px-2">
                     <div className="w-full h-1 bg-slate-200 rounded-full absolute top-1/2 -mt-0.5"></div>
                     <div className="w-[40%] h-1 bg-[#1b52d6] rounded-full absolute top-1/2 -mt-0.5 z-10 left-[0%]"></div>
                     <div className="w-[20%] h-1 bg-[#fbc02d] rounded-full absolute top-1/2 -mt-0.5 z-10 left-[40%]"></div>
                     
                     <div className="w-4 h-4 bg-white border-2 border-[#1b52d6] rounded-full absolute top-1/2 -mt-2 shadow-md z-20 left-[0%]"></div>
                     <div className="w-4 h-4 bg-white border-2 border-[#fbc02d] rounded-full absolute top-1/2 -mt-2 shadow-md z-20 left-[40%]"></div>
                     
                     <div className="flex justify-between mt-4">
                       <span className="text-xs text-slate-500 font-medium whitespace-nowrap -ml-2">₹5/day</span>
                       <span className="text-xs text-slate-500 font-medium whitespace-nowrap ml-6">₹100/day</span>
                       <span className="text-xs text-slate-500 font-medium whitespace-nowrap ml-16">₹200</span>
                       <span className="text-xs text-slate-500 font-medium whitespace-nowrap -mr-3">₹1000</span>
                     </div>
                  </div>

                  <p className="text-[13px] text-slate-500 mt-2 mb-8 xl:mb-0">Note: Final price will be adjustable according to demand</p>

                  <div className="flex-1"></div>

                  <div className="flex justify-end mt-auto xl:absolute xl:bottom-6 xl:right-6">
                    <button 
                      onClick={handleNext}
                      className="w-[180px] bg-[#1b52d6] text-white py-3 rounded-md font-bold shadow-sm shadow-blue-500/20 hover:bg-[#103387] flex justify-center items-center gap-1 transition-colors"
                    >
                      Next <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                </div>
              </div>
            </div>
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
