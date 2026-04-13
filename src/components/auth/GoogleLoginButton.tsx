"use client";

import { useEffect, useRef } from "react";

type GoogleLoginButtonProps = {
  onSuccess: (userName?: string) => void;
  onError: (message: string) => void;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: Record<string, string>,
          ) => void;
        };
      };
    };
  }
}

export function GoogleLoginButton({ onSuccess, onError }: GoogleLoginButtonProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) {
      return;
    }

    const initialize = () => {
      if (
        initializedRef.current ||
        !window.google ||
        !mountRef.current ||
        !clientId
      ) {
        return;
      }

      mountRef.current.innerHTML = "";

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (googleResponse) => {
          try {
            const response = await fetch("/api/auth/google", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ credential: googleResponse.credential }),
            });

            const payload = (await response.json()) as {
              success: boolean;
              message?: string;
              user?: { name?: string };
            };

            if (!response.ok || !payload.success) {
              onError(payload.message || "Google login failed");
              return;
            }

            onSuccess(payload.user?.name);
          } catch {
            onError("Google login failed");
          }
        },
      });

      window.google.accounts.id.renderButton(mountRef.current, {
        type: "standard",
        size: "large",
        text: "continue_with",
        shape: "rectangular",
        width: "390",
        logo_alignment: "left",
        theme: "outline",
      });

      initializedRef.current = true;
    };

    const existingScript = document.getElementById(
      "google-identity-script",
    ) as HTMLScriptElement | null;

    if (existingScript) {
      initialize();
      return;
    }

    const script = document.createElement("script");
    script.id = "google-identity-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initialize;
    script.onerror = () => onError("Google script failed to load");
    document.body.appendChild(script);
  }, [clientId, onError, onSuccess]);

  if (!clientId) {
    return (
      <button
        type="button"
        className="w-full rounded-[10px] border border-[#d3dbec] bg-white py-3 text-sm font-medium text-[#7d88a5]"
        disabled
      >
        Google login not configured
      </button>
    );
  }

  return <div ref={mountRef} className="w-full overflow-hidden rounded-[10px]" />;
}
