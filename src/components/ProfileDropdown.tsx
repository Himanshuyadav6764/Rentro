"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Bell,
  ChevronRight,
  Globe,
  HelpCircle,
  LogOut,
  Mail,
  MessageCircle,
  Moon,
  Settings,
  Shield,
  Sun,
  User,
} from "lucide-react";

type ThemeMode = "light" | "dark";
type UiLanguage = "en" | "hi" | "hinglish";
type Panel = "main" | "help" | "settings" | "language";

type PreferencesState = {
  pushNotifications: boolean;
  emailNotifications: boolean;
  soundEffects: boolean;
  compactLayout: boolean;
  profilePublic: boolean;
};

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onViewProfile: () => void;
  userName: string;
  triggerRef?: React.RefObject<HTMLElement | null>;
}

const LANGUAGE_STORAGE_KEY = "rentro_ui_language";
const THEME_STORAGE_KEY = "rentro_theme";
const SETTINGS_STORAGE_KEY = "rentro_user_settings";
const SUPPORT_TICKET_STORAGE_KEY = "rentro_support_tickets";

const defaultSettings: PreferencesState = {
  pushNotifications: true,
  emailNotifications: true,
  soundEffects: true,
  compactLayout: false,
  profilePublic: true,
};

const labelsByLanguage: Record<
  UiLanguage,
  {
    viewEditProfile: string;
    help: string;
    settings: string;
    language: string;
    logout: string;
    helpSupport: string;
    settingsTitle: string;
    languageTitle: string;
    back: string;
    selectLanguage: string;
    appearance: string;
    brightMode: string;
    darkMode: string;
    notifications: string;
    privacy: string;
    layout: string;
    pushNotificationsLabel: string;
    emailAlertsLabel: string;
    soundEffectsLabel: string;
    compactLayoutLabel: string;
    publicProfileLabel: string;
    quickActions: string;
    faq: string;
    supportTicket: string;
    submitTicket: string;
    issuePlaceholder: string;
    ticketSuccess: string;
  }
> = {
  en: {
    viewEditProfile: "View and edit profile",
    help: "Help",
    settings: "Settings",
    language: "Language",
    logout: "Logout",
    helpSupport: "Help & Support",
    settingsTitle: "Settings",
    languageTitle: "Choose Language",
    back: "Back",
    selectLanguage: "Select your preferred language",
    appearance: "Appearance",
    brightMode: "Bright mode",
    darkMode: "Dark mode",
    notifications: "Notifications",
    privacy: "Privacy",
    layout: "Layout",
    pushNotificationsLabel: "Push Notifications",
    emailAlertsLabel: "Email Alerts",
    soundEffectsLabel: "Sound Effects",
    compactLayoutLabel: "Compact Layout",
    publicProfileLabel: "Public Profile",
    quickActions: "Quick Actions",
    faq: "Frequently asked questions",
    supportTicket: "Raise support ticket",
    submitTicket: "Submit Ticket",
    issuePlaceholder: "Describe your issue in detail...",
    ticketSuccess: "Support ticket submitted. Team will contact you soon.",
  },
  hi: {
    viewEditProfile: "प्रोफाइल देखें और संपादित करें",
    help: "मदद",
    settings: "सेटिंग्स",
    language: "भाषा",
    logout: "लॉगआउट",
    helpSupport: "मदद और सहायता",
    settingsTitle: "सेटिंग्स",
    languageTitle: "भाषा चुनें",
    back: "वापस",
    selectLanguage: "अपनी पसंद की भाषा चुनें",
    appearance: "रूप",
    brightMode: "ब्राइट मोड",
    darkMode: "डार्क मोड",
    notifications: "सूचनाएं",
    privacy: "गोपनीयता",
    layout: "लेआउट",
    pushNotificationsLabel: "पुश सूचनाएं",
    emailAlertsLabel: "ईमेल अलर्ट",
    soundEffectsLabel: "साउंड इफेक्ट्स",
    compactLayoutLabel: "कॉम्पैक्ट लेआउट",
    publicProfileLabel: "पब्लिक प्रोफाइल",
    quickActions: "त्वरित विकल्प",
    faq: "अक्सर पूछे जाने वाले सवाल",
    supportTicket: "सहायता टिकट बनाएं",
    submitTicket: "टिकट सबमिट करें",
    issuePlaceholder: "अपनी समस्या विस्तार से लिखें...",
    ticketSuccess: "सपोर्ट टिकट सबमिट हो गया। टीम जल्द संपर्क करेगी।",
  },
  hinglish: {
    viewEditProfile: "View and edit profile",
    help: "Help",
    settings: "Settings",
    language: "Language",
    logout: "Logout",
    helpSupport: "Help & Support",
    settingsTitle: "Settings",
    languageTitle: "Language choose karo",
    back: "Back",
    selectLanguage: "Apni preferred language choose karo",
    appearance: "Appearance",
    brightMode: "Bright mode",
    darkMode: "Dark mode",
    notifications: "Notifications",
    privacy: "Privacy",
    layout: "Layout",
    pushNotificationsLabel: "Push Notifications",
    emailAlertsLabel: "Email Alerts",
    soundEffectsLabel: "Sound Effects",
    compactLayoutLabel: "Compact Layout",
    publicProfileLabel: "Public Profile",
    quickActions: "Quick Actions",
    faq: "Frequently asked questions",
    supportTicket: "Support ticket raise karo",
    submitTicket: "Submit Ticket",
    issuePlaceholder: "Issue detail me likho...",
    ticketSuccess: "Support ticket submit ho gaya. Team jaldi contact karegi.",
  },
};

function readLanguage(): UiLanguage {
  if (typeof window === "undefined") {
    return "en";
  }

  const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (saved === "en" || saved === "hi" || saved === "hinglish") {
    return saved;
  }

  return "en";
}

function readTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "light";
  }

  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  return saved === "dark" ? "dark" : "light";
}

function applyTheme(mode: ThemeMode) {
  if (typeof window === "undefined") {
    return;
  }

  const html = document.documentElement;
  const body = document.body;
  html.setAttribute("data-theme", mode);
  body.setAttribute("data-theme", mode);
  localStorage.setItem(THEME_STORAGE_KEY, mode);

  window.dispatchEvent(
    new CustomEvent("rentro-theme-changed", {
      detail: { theme: mode },
    }),
  );
}

function applyLanguage(language: UiLanguage) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  document.documentElement.lang = language === "hi" ? "hi" : "en";

  window.dispatchEvent(
    new CustomEvent("rentro-language-changed", {
      detail: { language },
    }),
  );
}

function readSavedSettings(): PreferencesState {
  if (typeof window === "undefined") {
    return defaultSettings;
  }

  const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
  if (!raw) {
    return defaultSettings;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PreferencesState>;
    return {
      pushNotifications:
        typeof parsed.pushNotifications === "boolean"
          ? parsed.pushNotifications
          : defaultSettings.pushNotifications,
      emailNotifications:
        typeof parsed.emailNotifications === "boolean"
          ? parsed.emailNotifications
          : defaultSettings.emailNotifications,
      soundEffects:
        typeof parsed.soundEffects === "boolean"
          ? parsed.soundEffects
          : defaultSettings.soundEffects,
      compactLayout:
        typeof parsed.compactLayout === "boolean"
          ? parsed.compactLayout
          : defaultSettings.compactLayout,
      profilePublic:
        typeof parsed.profilePublic === "boolean"
          ? parsed.profilePublic
          : defaultSettings.profilePublic,
    };
  } catch {
    return defaultSettings;
  }
}

function applyCompactMode(enabled: boolean) {
  if (typeof window === "undefined") {
    return;
  }

  document.body.classList.toggle("compact-mode", enabled);
}

export default function ProfileDropdown({
  isOpen,
  onClose,
  onLogout,
  onViewProfile,
  userName,
  triggerRef,
}: ProfileDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [activePanel, setActivePanel] = useState<Panel>("main");
  const [language, setLanguage] = useState<UiLanguage>("en");
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");
  const [settingsState, setSettingsState] = useState<PreferencesState>(defaultSettings);
  const [ticketMessage, setTicketMessage] = useState("");
  const [ticketNotice, setTicketNotice] = useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setLanguage(readLanguage());
    const theme = readTheme();
    setThemeMode(theme);
    applyTheme(theme);

    const savedSettings = readSavedSettings();
    setSettingsState(savedSettings);
    applyCompactMode(savedSettings.compactLayout);
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const triggerEl = triggerRef?.current;

      if (dropdownRef.current?.contains(target)) {
        return;
      }

      if (triggerEl?.contains(target)) {
        return;
      }

      onClose();
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose, triggerRef]);

  const labels = useMemo(() => labelsByLanguage[language], [language]);

  if (!isOpen) {
    return null;
  }

  function persistSettings(nextState: PreferencesState) {
    setSettingsState(nextState);
    if (typeof window !== "undefined") {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(nextState));
    }
    applyCompactMode(nextState.compactLayout);
  }

  function toggleSetting(key: keyof PreferencesState) {
    const next = {
      ...settingsState,
      [key]: !settingsState[key],
    };

    persistSettings(next);
  }

  function handleThemeChange(mode: ThemeMode) {
    setThemeMode(mode);
    applyTheme(mode);
  }

  function handleLanguageSelect(nextLanguage: UiLanguage) {
    setLanguage(nextLanguage);
    applyLanguage(nextLanguage);
  }

  function submitSupportTicket() {
    if (!ticketMessage.trim()) {
      return;
    }

    if (typeof window !== "undefined") {
      const raw = localStorage.getItem(SUPPORT_TICKET_STORAGE_KEY);
      const previous = raw ? (JSON.parse(raw) as Array<{ message: string; createdAt: string }>) : [];

      const next = [
        {
          message: ticketMessage.trim(),
          createdAt: new Date().toISOString(),
        },
        ...previous,
      ];

      localStorage.setItem(SUPPORT_TICKET_STORAGE_KEY, JSON.stringify(next));
    }

    setTicketMessage("");
    setTicketNotice(labels.ticketSuccess);
    window.setTimeout(() => {
      setTicketNotice("");
    }, 3000);
  }

  const panelTitle =
    activePanel === "help"
      ? labels.helpSupport
      : activePanel === "settings"
        ? labels.settingsTitle
        : activePanel === "language"
          ? labels.languageTitle
          : "";

  return (
    <div
      ref={dropdownRef}
      className="absolute top-10 right-6 w-full max-w-[360px] bg-white z-[2000] shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-slate-100 rounded-xl overflow-hidden flex flex-col animate-in slide-in-from-top-4 duration-300"
    >
      {activePanel === "main" ? (
        <>
          <div className="px-5 pt-6 pb-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-50 border-2 border-emerald-500 overflow-hidden flex items-center justify-center p-0.5 relative">
              <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                <User size={24} className="text-slate-300" />
              </div>
              <div className="absolute top-0.5 right-0.5 w-2 h-2 bg-yellow-400 rounded-full border border-white" />
            </div>
            <div className="flex flex-col min-w-0">
              <h2 className="text-xl font-bold text-slate-800 tracking-tight leading-none truncate">
                {userName} ...
              </h2>
            </div>
          </div>

          <div className="px-5 py-4">
            <button
              onClick={onViewProfile}
              className="w-full bg-[#002f34] text-white py-3 rounded-lg font-bold text-[14px] hover:opacity-90 active:scale-95 transition-all"
            >
              {labels.viewEditProfile}
            </button>
          </div>

          <div className="w-full h-[1px] bg-slate-100" />

          <div className="flex flex-col max-h-[430px] overflow-y-auto hide-scrollbar">
            <DropdownItem
              icon={<HelpCircle size={18} />}
              label={labels.help}
              onClick={() => setActivePanel("help")}
            />
            <DropdownItem
              icon={<Settings size={18} />}
              label={labels.settings}
              onClick={() => setActivePanel("settings")}
            />
            <DropdownItem
              icon={<Globe size={18} />}
              label={labels.language}
              rightContent={
                <span className="text-xs font-black uppercase text-slate-400">
                  {language}
                </span>
              }
              onClick={() => setActivePanel("language")}
            />

            <div className="w-full h-[1px] bg-slate-100" />

            <button
              onClick={onLogout}
              className="flex items-center gap-4 px-5 py-4 hover:bg-rose-50 transition-all group w-full"
            >
              <LogOut size={18} className="text-rose-500" />
              <span className="text-[15px] font-black text-rose-500 uppercase tracking-widest">
                {labels.logout}
              </span>
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
            <button
              onClick={() => setActivePanel("main")}
              className="grid h-8 w-8 place-items-center rounded-lg hover:bg-slate-100 text-slate-600"
            >
              <ArrowLeft size={18} />
            </button>
            <p className="text-base font-black text-slate-800">{panelTitle}</p>
          </div>

          {activePanel === "language" ? (
            <div className="p-5 space-y-4">
              <p className="text-sm text-slate-500">{labels.selectLanguage}</p>
              <div className="space-y-2">
                {[
                  { key: "en", label: "English" },
                  { key: "hi", label: "Hindi" },
                  { key: "hinglish", label: "Hinglish" },
                ].map((option) => {
                  const selected = language === option.key;
                  return (
                    <button
                      key={option.key}
                      onClick={() => handleLanguageSelect(option.key as UiLanguage)}
                      className={`w-full rounded-lg border px-4 py-3 text-left font-semibold transition-colors ${
                        selected
                          ? "border-[#1b52d6] bg-blue-50 text-[#1b52d6]"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {activePanel === "settings" ? (
            <div className="p-5 space-y-5 max-h-[430px] overflow-y-auto hide-scrollbar">
              <section>
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">
                  {labels.appearance}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleThemeChange("light")}
                    className={`rounded-lg border p-3 text-sm font-bold transition-colors ${
                      themeMode === "light"
                        ? "border-[#1b52d6] bg-blue-50 text-[#1b52d6]"
                        : "border-slate-200"
                    }`}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <Sun size={16} /> {labels.brightMode}
                    </span>
                  </button>
                  <button
                    onClick={() => handleThemeChange("dark")}
                    className={`rounded-lg border p-3 text-sm font-bold transition-colors ${
                      themeMode === "dark"
                        ? "border-[#1b52d6] bg-blue-50 text-[#1b52d6]"
                        : "border-slate-200"
                    }`}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <Moon size={16} /> {labels.darkMode}
                    </span>
                  </button>
                </div>
              </section>

              <section>
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">
                  {labels.notifications}
                </h4>
                <ToggleRow
                  label={labels.pushNotificationsLabel}
                  value={settingsState.pushNotifications}
                  onChange={() => toggleSetting("pushNotifications")}
                  icon={<Bell size={16} />}
                />
                <ToggleRow
                  label={labels.emailAlertsLabel}
                  value={settingsState.emailNotifications}
                  onChange={() => toggleSetting("emailNotifications")}
                  icon={<Mail size={16} />}
                />
                <ToggleRow
                  label={labels.soundEffectsLabel}
                  value={settingsState.soundEffects}
                  onChange={() => toggleSetting("soundEffects")}
                  icon={<MessageCircle size={16} />}
                />
              </section>

              <section>
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">
                  {labels.layout}
                </h4>
                <ToggleRow
                  label={labels.compactLayoutLabel}
                  value={settingsState.compactLayout}
                  onChange={() => toggleSetting("compactLayout")}
                  icon={<Settings size={16} />}
                />
              </section>

              <section>
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">
                  {labels.privacy}
                </h4>
                <ToggleRow
                  label={labels.publicProfileLabel}
                  value={settingsState.profilePublic}
                  onChange={() => toggleSetting("profilePublic")}
                  icon={<Shield size={16} />}
                />
              </section>
            </div>
          ) : null}

          {activePanel === "help" ? (
            <div className="p-5 space-y-5 max-h-[430px] overflow-y-auto hide-scrollbar">
              <section>
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">
                  {labels.quickActions}
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  <a
                    href="mailto:help@rentro.app"
                    className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold hover:bg-slate-50"
                  >
                    Email: help@rentro.app
                  </a>
                  <a
                    href="tel:+919876543210"
                    className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold hover:bg-slate-50"
                  >
                    Call Support: +91 98765 43210
                  </a>
                  <a
                    href="https://wa.me/919876543210"
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold hover:bg-slate-50"
                  >
                    WhatsApp Chat Support
                  </a>
                </div>
              </section>

              <section>
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">
                  {labels.faq}
                </h4>
                <FaqItem
                  q="How do I request a rental?"
                  a="Open any item, click RENT NOW, choose duration and confirm request."
                />
                <FaqItem
                  q="When is security deposit refunded?"
                  a="After return verification by owner, deposit is auto-refunded to your original method."
                />
                <FaqItem
                  q="How to report fraud or abuse?"
                  a="Use support ticket below with listing ID, screenshots, and chat details for immediate review."
                />
              </section>

              <section>
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">
                  {labels.supportTicket}
                </h4>
                <textarea
                  value={ticketMessage}
                  onChange={(event) => setTicketMessage(event.target.value)}
                  placeholder={labels.issuePlaceholder}
                  className="min-h-[90px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#1b52d6]"
                />
                <button
                  onClick={submitSupportTicket}
                  className="mt-2 w-full rounded-lg bg-[#002f34] py-3 text-sm font-bold text-white hover:opacity-90"
                >
                  {labels.submitTicket}
                </button>
                {ticketNotice ? (
                  <p className="mt-2 text-xs font-semibold text-emerald-600">{ticketNotice}</p>
                ) : null}
              </section>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

function DropdownItem({
  icon,
  label,
  rightContent,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  rightContent?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-all group"
    >
      <div className="flex items-center gap-4">
        <div className="text-slate-700">{icon}</div>
        <span className="text-[15px] font-medium text-slate-700">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {rightContent}
        <ChevronRight size={18} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </button>
  );
}

function ToggleRow({
  label,
  value,
  onChange,
  icon,
}: {
  label: string;
  value: boolean;
  onChange: () => void;
  icon: React.ReactNode;
}) {
  return (
    <div className="mb-2 flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5">
      <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-700">
        <span className="text-slate-500">{icon}</span>
        {label}
      </div>
      <button
        type="button"
        onClick={onChange}
        className={`relative h-6 w-11 rounded-full transition-colors ${
          value ? "bg-emerald-500" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
            value ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="mb-2 rounded-lg border border-slate-200 px-3 py-2">
      <summary className="cursor-pointer text-sm font-semibold text-slate-800">{q}</summary>
      <p className="mt-2 text-xs leading-relaxed text-slate-600">{a}</p>
    </details>
  );
}
