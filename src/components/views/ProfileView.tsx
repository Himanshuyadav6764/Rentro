import React from 'react';
import { 
  Home, MessageCircle, ShieldCheck, FileText, 
  CreditCard, Shield, User, MapPin, CheckCircle2, 
  ChevronDown, Settings, Bell, Star, FileQuestion, ChevronRight
} from 'lucide-react';

export default function ProfileView() {
  return (
    <div className="w-full bg-[#f8fafe] flex font-sans max-w-7xl mx-auto h-full overflow-hidden pb-16">
      
      {/* Left Sidebar Menu */}
      <div className="w-[240px] bg-[#f8fafe] border-r border-slate-200 flex-shrink-0 flex flex-col hidden md:flex overflow-y-auto pt-6 px-4">
        <div className="flex items-center gap-2 mb-8 px-2">
          <User className="w-5 h-5 text-[#1c2b4c]" />
          <span className="font-bold text-[#1c2b4c]">My Profile</span>
        </div>

        <nav className="flex flex-col gap-1">
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-[#1c2b4c] font-medium hover:bg-slate-100 rounded-md">
             <Home className="w-[18px] h-[18px] text-[#1c2b4c]" /> Home
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-[#1c2b4c] font-medium hover:bg-slate-100 rounded-md">
             <MessageCircle className="w-[18px] h-[18px] text-[#1c2b4c]" /> Chats
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-[#1c2b4c] font-medium hover:bg-slate-100 rounded-md">
             <ShieldCheck className="w-[18px] h-[18px] text-[#1c2b4c]" /> Sell
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-[#1c2b4c] font-medium hover:bg-slate-100 rounded-md">
             <FileText className="w-[18px] h-[18px] text-[#1c2b4c]" /> My Rentals
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-[#1c2b4c] font-medium hover:bg-slate-100 rounded-md">
             <CreditCard className="w-[18px] h-[18px] text-[#1c2b4c]" /> Payments
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-[#1c2b4c] font-medium hover:bg-slate-100 rounded-md">
             <Shield className="w-[18px] h-[18px] text-[#fbc02d]" /> Trust Score
          </a>
          
          <div className="my-2 border-t border-slate-200"></div>
          
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-[#1b52d6] font-bold bg-blue-50/50 rounded-md border-l-4 border-[#1b52d6]">
             <User className="w-[18px] h-[18px] text-[#1b52d6]" strokeWidth={2.5} /> Profile
          </a>
        </nav>
      </div>

      {/* Center Dashboard */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#f8fafe]">
         
         {/* Profile Card */}
         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
              <div className="flex items-center gap-4">
                 <div className="w-20 h-20 bg-[#fbc02d] rounded-full overflow-hidden flex items-end justify-center relative border-4 border-white shadow-sm flex-shrink-0">
                    <User className="w-14 h-14 text-white translate-y-2 opacity-80" />
                 </div>
                 <div>
                    <h2 className="text-xl font-bold text-[#1c2b4c]">Ankush Agrawal</h2>
                    <p className="text-slate-600 text-sm mt-0.5">(+91) 9876543211</p>
                    <div className="flex items-center gap-1 mt-0.5">
                       <CheckCircle2 className="w-3.5 h-3.5 text-[#219653]" />
                       <span className="text-sm font-medium text-slate-700">ankush93@example.com</span>
                    </div>
                 </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-2 md:mt-0">
                 <div className="flex items-center gap-1 bg-[#eaf8f4] text-[#219653] px-3 py-1.5 rounded-full border border-[#a7d9c8]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="font-bold">Trust: 78</span>
                    <CheckCircle2 className="w-4 h-4" />
                 </div>
                 
                 <div className="flex items-center gap-1.5 text-[#1b52d6] font-medium border border-blue-100 bg-blue-50 px-3 py-1.5 rounded-full cursor-pointer hover:bg-blue-100">
                    <MapPin className="w-4 h-4" />
                    <span>Columbia Hostel Area</span>
                    <ChevronDown className="w-4 h-4" />
                 </div>
                 
                 <button className="bg-[#1b52d6] text-white px-5 py-2 rounded-md font-bold text-sm shadow-sm hover:bg-[#103387]">
                    Edit Profile
                 </button>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 border-t border-slate-100 pt-6">
               <div className="text-center md:border-r border-slate-100">
                 <p className="text-2xl font-bold text-[#1c2b4c]">4 <span className="text-base text-slate-500 font-medium">Active</span></p>
                 <div className="flex items-center justify-center gap-1 mt-1 text-slate-600 text-sm">
                   <div className="w-3 h-0.5 bg-[#1b52d6]"></div> Total Rentals
                 </div>
               </div>
               <div className="text-center md:border-r border-slate-100">
                 <p className="text-2xl font-bold text-[#1c2b4c]">12 <span className="text-base text-slate-500 font-medium">All-Time</span></p>
                 <div className="flex items-center justify-center gap-1 mt-1 text-slate-600 text-sm text-center">
                   Total Paid
                 </div>
               </div>
               <div className="text-center flex flex-col justify-center items-center">
                 <p className="text-sm text-slate-800 font-medium">Joined April</p>
                 <p className="text-xs text-slate-500 mt-0.5">2 days ago</p>
               </div>
            </div>
         </div>

         {/* Verification/Mock Rental */}
         <h3 className="text-[#1b52d6] text-[17px] font-bold mb-3">Personal Verification</h3>
         <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6 p-5">
           <div className="flex justify-between items-start">
             <div className="flex gap-4">
                <div className="w-16 h-16 bg-slate-200 rounded-lg flex-shrink-0 relative overflow-hidden flex items-center justify-center border border-slate-300">
                   <div className="w-10 h-11 bg-[#2a2d36] rounded shadow-md flex flex-col p-1">
                     <div className="w-full h-3 bg-[#8ebfa1] rounded-sm mb-1"></div>
                     <div className="grid grid-cols-3 gap-[2px] flex-1">
                        {[...Array(9)].map((_, i) => <div key={i} className="bg-[#41434c] rounded-[1px]"></div>)}
                     </div>
                   </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-[#1c2b4c] text-[16px]">Casio Calculator</h4>
                    <span className="bg-[#fdf2d0] text-[#a0740b] text-[11px] font-bold px-2 py-0.5 rounded-sm">Pending Return</span>
                  </div>
                  <p className="text-[14px] text-slate-600 mb-1">Rohan S. • <span className="font-medium">April 15 - April 28</span></p>
                  <p className="text-[14px] text-slate-700">24 Rented Days • ₹ 10/day • Paid: ₹ 240</p>
                </div>
             </div>
             <div className="text-right">
                <p className="text-sm text-slate-500 mb-1">2 days e</p>
                <p className="text-sm text-slate-500">3:58 PM</p>
             </div>
           </div>
           
           <div className="mt-4 flex items-center justify-between">
              <p className="text-[14px] text-slate-600 italic">Last: &quot;Got it, will return by Sunday evening.&quot;</p>
              <div className="flex gap-2">
                 <button className="bg-[#1b52d6] text-white px-5 py-1.5 rounded font-medium text-[15px]">Extend</button>
                 <button className="bg-[#fbc02d] text-white px-5 py-1.5 rounded font-medium text-[15px]">Close</button>
              </div>
           </div>
         </div>

         {/* Statistics */}
         <div className="flex items-center gap-6 border-b border-slate-200 mb-4">
            <button className="pb-2 border-b-[3px] border-[#1b52d6] text-[#1b52d6] font-bold flex-1 md:flex-none text-left">My Statistics</button>
            <button className="pb-2 border-b-[3px] border-transparent text-slate-500 font-medium hidden md:block">Rental Performance Last 6 Months</button>
            <button className="pb-2 border-b-[3px] border-transparent text-slate-500 font-medium flex items-center gap-1 md:ml-auto">
               <div className="w-4 h-4 rounded-full border border-slate-400 flex items-center justify-center text-[10px]">E</div> Returns
            </button>
         </div>

         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col md:flex-row mb-6">
            <div className="md:w-1/2 md:border-r border-slate-100 pr-4">
               <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 bg-slate-200 rounded-lg flex-shrink-0 relative overflow-hidden flex items-center justify-center border border-slate-100">
                      <div className="relative">
                        <div className="w-10 h-[5px] bg-blue-800 rounded mb-0.5 transform -skew-x-[20deg]"></div>
                        <div className="w-11 h-[5px] bg-emerald-700 rounded mb-0.5 transform -skew-x-[20deg]"></div>
                        <div className="w-12 h-[5px] bg-orange-200 rounded mb-0.5 transform -skew-x-[20deg]"></div>
                        <div className="w-12 h-[5px] bg-red-800 rounded transform -skew-x-[20deg]"></div>
                      </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1c2b4c] text-[16px] mb-0.5">Engineering Books</h4>
                    <p className="text-[13px] text-slate-600"><span className="text-[#1b52d6] font-medium">Priya Verma</span> • Mar 10 - Mar 25 • ₹ 300</p>
                    <p className="text-[13px] text-slate-700 mt-1">15 Rented Days • ₹ 20/day • Paid: ₹ 300</p>
                  </div>
               </div>
            </div>
            
            <div className="md:w-1/2 pt-4 md:pt-0 pl-0 md:pl-4">
               <div className="flex items-end gap-3 h-24 mb-2">
                 {/* Chart bars mock */}
                 <div className="flex flex-col items-center flex-1">
                    <div className="w-full bg-[#1b52d6] h-[30%] rounded-t-sm"></div>
                    <span className="text-[10px] text-slate-500 mt-1">Nov</span>
                 </div>
                 <div className="flex flex-col items-center flex-1">
                    <div className="w-full bg-[#1b52d6] h-[40%] rounded-t-sm"></div>
                    <span className="text-[10px] text-slate-500 mt-1">Dec</span>
                 </div>
                 <div className="flex flex-col items-center flex-1">
                    <div className="w-full bg-[#219653] h-[70%] rounded-t-sm relative"></div>
                    <span className="text-[10px] text-slate-500 mt-1 text-center truncate">Jan</span>
                 </div>
                 <div className="flex flex-col items-center flex-1">
                    <div className="w-full bg-[#1b52d6] h-[50%] rounded-t-sm"></div>
                    <span className="text-[10px] text-slate-500 mt-1">Feb</span>
                 </div>
                 <div className="flex flex-col items-center flex-1">
                    <div className="w-full bg-[#1b52d6] h-[80%] rounded-t-sm relative">
                       <div className="absolute top-[-8px] right-[-8px] bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex justify-center items-center font-bold">1</div>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1">Mar</span>
                 </div>
               </div>
               <div className="flex gap-4 justify-center">
                 <div className="flex items-center gap-1 text-[11px] text-slate-600"><div className="w-3 h-1 bg-[#219653]"></div> Items Rented</div>
                 <div className="flex items-center gap-1 text-[11px] text-slate-600"><div className="w-3 h-1 bg-[#1b52d6]"></div> Days Rented</div>
               </div>
            </div>
         </div>

      </div>

      {/* Right Sidebar widgets */}
      <div className="w-[300px] bg-[#f8fafe] flex-shrink-0 flex flex-col hidden lg:flex overflow-y-auto p-4 border-l border-slate-200">
         
         {/* Trust Score Tips Widget */}
         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-4">
            <h3 className="font-bold text-[#1c2b4c] text-[16px] mb-3">Trust Score Tips</h3>
            
            <div className="border border-emerald-100 bg-[#f4fcf9] rounded-lg p-3 flex flex-col items-center mb-4">
               <div className="bg-[#219653] text-white px-2 py-0.5 rounded-sm font-bold text-sm mb-1 flex items-center gap-1">
                 <ShieldCheck className="w-4 h-4" /> 78 Trust Score
               </div>
               <div className="flex text-[#fbc02d] gap-0.5">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 text-slate-300" />
               </div>
            </div>

            <h4 className="font-bold text-[#1b52d6] text-sm mb-3">Tip Improve Trust Score:</h4>
            <div className="flex flex-col gap-2.5 text-sm text-slate-700 mb-5">
               <div className="flex items-start gap-2">
                 <CheckCircle2 className="w-4 h-4 text-[#219653] mt-0.5 flex-shrink-0" />
                 <span>Return items on time</span>
               </div>
               <div className="flex items-start gap-2">
                 <CheckCircle2 className="w-4 h-4 text-[#219653] mt-0.5 flex-shrink-0" />
                 <span>Maintain item condition</span>
               </div>
               <div className="flex items-start gap-2">
                 <CheckCircle2 className="w-4 h-4 text-[#219653] mt-0.5 flex-shrink-0" />
                 <span>Be responsive & polite</span>
               </div>
            </div>
            <button className="w-full bg-[#1b52d6] text-white py-2 rounded-md font-bold text-sm hover:bg-[#103387]">
               Learn More
            </button>
         </div>

         {/* Account Settings */}
         <div className="bg-[#f0f4f8] rounded-xl border border-slate-200 p-5 mb-4">
            <h3 className="font-bold text-[#1c2b4c] text-[16px] mb-4">Account Settings</h3>
            
            <div className="flex justify-between items-center mb-4 border-b border-slate-200 pb-3">
               <span className="text-[14.5px] font-medium text-[#1c2b4c]">Password:</span>
               <span className="text-[13px] text-[#1b52d6] cursor-pointer hover:underline">Change Password</span>
            </div>
            
            <div className="flex justify-between items-center mb-4 border-b border-slate-200 pb-3">
               <span className="text-[14.5px] font-medium text-[#1c2b4c]">Notifications:</span>
               <div className="w-10 h-5 bg-[#1b52d6] rounded-full relative cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
               </div>
            </div>
            
            <div className="flex justify-between items-center">
               <span className="text-[14.5px] font-medium text-[#1c2b4c]">Payout Method:</span>
               <span className="text-[12px] bg-white px-2 py-1 rounded border border-slate-200 text-slate-600"><span className="text-[#1b52d6] font-medium">UPI:</span> ankush93@upi</span>
            </div>
         </div>

         {/* FAQ */}
         <div className="bg-[#fdf8e6] rounded-xl border border-[#f5e3ba] p-5">
            <div className="flex justify-between items-center mb-4">
               <h3 className="font-bold text-[#1c2b4c] text-[16px]">Frequently Asked Questions</h3>
               <div className="bg-[#fbc02d] text-white w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs">!</div>
            </div>
            
            <div className="flex flex-col gap-3">
               <div className="flex justify-between items-center cursor-pointer hover:opacity-80">
                  <span className="text-[13px] text-slate-700">How can I increase my Trust Score?</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
               </div>
               <div className="flex justify-between items-center cursor-pointer hover:opacity-80">
                  <span className="text-[13px] text-slate-700">Is there a late return fee?</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
               </div>
            </div>
         </div>

      </div>

    </div>
  );
}
