"use client";
import { useEffect, useState } from "react";

interface ExamSecurityOptions {
  submitted: boolean;
  startProtection: boolean;
  finishAndSubmit: () => void;
  ignoreFocus?: boolean;
}

export function useExamSecurity({
  submitted,
  startProtection,
  finishAndSubmit,
  ignoreFocus = false,
}: ExamSecurityOptions) {
  const [showExitModal, setShowExitModal] = useState(false);
  const [showAutoSubmitFocusModal, setShowAutoSubmitFocusModal] = useState(false);

  // Detectar pérdida de foco (cambio de pestaña, minimizar, etc.)
  useEffect(() => {
    if (submitted || !startProtection || ignoreFocus) return;

    function handleFocusLoss() {
      console.warn("⚠️ Examen finalizado por pérdida de foco.");
      setShowAutoSubmitFocusModal(true);
      ignoreFocus = true;
      setTimeout(() => finishAndSubmit(), 4000);

    }

    function handleVisibilityChange() {
      if (document.hidden) handleFocusLoss();
    }

    window.addEventListener("blur", handleFocusLoss);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("blur", handleFocusLoss);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [submitted, startProtection, ignoreFocus, finishAndSubmit]);



  // Bloquear teclas (Escape, Alt+Tab, Ctrl+Tab, Cmd+Tab, F11)
  useEffect(() => {
    if (submitted || !startProtection) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (
        e.key === "Escape" ||
        e.key === "F11" ||
        ((e.altKey || e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "tab")
      ) {
        e.preventDefault();
        setShowExitModal(true);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [submitted, startProtection]);

  useEffect(() => {
    if (submitted || !startProtection) return;

    function handleFullscreenChange() {
      if (!document.fullscreenElement && !showExitModal) {
        setShowExitModal(true);
      }
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [submitted, startProtection, showExitModal]);


  function confirmExit() {
    document.exitFullscreen().catch(() => { });
    finishAndSubmit();
    setShowExitModal(false);
  }

  function cancelExit() {
    setShowExitModal(false);
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => { });
    }
  }

  return {
    showExitModal,
    confirmExit,
    cancelExit,
    showAutoSubmitFocusModal
  };
}
