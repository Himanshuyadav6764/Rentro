"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginCard() {
  const router = useRouter();
  const [phone, setPhone] = useState("9876543210");
  const [otp, setOtp] = useState("123456");

  return (
    <div className="glass-card relative mx-auto w-full max-w-[460px] overflow-hidden rounded-2xl border border-[#e4e9f7]">
      <div className="px-5 pt-7 pb-6 sm:px-7">
        <div className="mx-auto mb-5 flex w-fit items-center gap-2 text-[#1a4cab]">
          <div className="grid h-9 w-9 place-items-center rounded-lg border border-[#cdd8ef] bg-[#ecf3ff] text-base font-semibold">S</div>
          <h1 className="text-[34px] font-bold leading-none tracking-tight">StudentRental</h1>
        </div>

        <div className="mb-5 text-center">
          <h2 className="text-[30px] font-semibold leading-tight text-[#1f2f54]">Welcome Back!</h2>
          <p className="mt-1 text-[14px] text-[#637097]">Dummy login preview mode</p>
        </div>

        <div className="mx-auto max-w-[390px] rounded-xl border border-[#dce3f1] bg-[#f7f9ff] px-4 py-4">
          <label className="mb-2 block text-[16px] font-medium text-[#202f53]">Phone Number</label>

          <div className="space-y-3">
            <div className="input-surface flex items-center rounded-lg">
              <div className="flex items-center gap-2 border-r border-[#d2d9ea] px-3 py-2 text-[14px] text-[#2e3a59]">
                <span className="text-[12px]">IN</span>
                <span>+91</span>
              </div>
              <input
                type="tel"
                inputMode="numeric"
                className="w-full bg-transparent px-3 py-2 text-[15px] text-[#26355b] outline-none"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="9876543210"
                maxLength={14}
              />
              <span className="mr-3 rounded-full bg-[#67be9d] px-2 py-1 text-xs font-semibold text-white">✓</span>
            </div>

            <div className="input-surface flex items-center rounded-lg">
              <input
                type="password"
                inputMode="numeric"
                className="w-full bg-transparent px-3 py-2 tracking-[0.2em] text-[15px] text-[#26355b] outline-none"
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                placeholder="******"
                maxLength={6}
              />
              <button type="button" className="px-3 text-[13px] text-[#8c7748]">
                Forgot {">"}
              </button>
            </div>

            <div className="rounded-lg bg-[#edf6f2] px-3 py-2 text-xs text-[#2d7d5f]">
              Verified successfully (dummy)
            </div>

            <button
              type="button"
              className="btn-primary mt-1 w-full rounded-[10px] py-2.5 text-[18px] font-semibold text-white"
              onClick={() => router.push("/home")}
            >
              Login (Dummy)
            </button>
          </div>

          <div className="my-3 flex items-center text-[#8691ad] text-xs">
            <div className="h-px flex-1 bg-[#dde3f2]" />
            <span className="px-3">or</span>
            <div className="h-px flex-1 bg-[#dde3f2]" />
          </div>

          <div className="space-y-3">
            <button
              type="button"
              className="w-full rounded-[10px] border border-[#d3dbec] bg-white py-2.5 text-[15px] font-medium text-[#3a4a74]"
              onClick={() => router.push("/home")}
            >
              Continue with Google (Dummy)
            </button>

            <button
              type="button"
              className="btn-primary flex w-full items-center justify-center gap-2 rounded-[10px] py-2.5 text-[15px] font-medium text-white"
              onClick={() => router.push("/home")}
            >
              <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-[#1b5ac5] text-sm font-bold">f</span>
              Continue with Facebook (Dummy)
            </button>
          </div>

          <p className="mt-4 flex items-center justify-center gap-2 text-center text-[12px] text-[#667292]">
            <span className="text-[#c6982f]">[shield]</span>
            Your data is safe and protected per our Privacy &amp; Terms
          </p>
        </div>

        <p className="mt-4 text-center text-[13px] text-[#3f4e73]">
          For support: <span className="font-medium text-[#1d4fab]">help@studentrentalapp.com</span>
        </p>
      </div>

      <div className="border-t border-[#d8e0f0] bg-[#eef3ff] px-6 py-3 text-center text-[12px] text-[#4f5d84]">
        Help Center - Privacy - Terms
      </div>
    </div>
  );
}
