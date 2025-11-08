"use client";
import React from "react";
import { useAlertStore } from "@/store/alerts";
import WarningAlert from "./WarningAlert";
import ErrorAlert from "./ErrorAlert";

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const { alerts, hideAlert } = useAlertStore();

  return (
    <>
      {children}

      {alerts.map((alert) => {
        if (alert.type === "warning") {
          return (
            <WarningAlert
              key={alert.id}
              visible={true}
              message={alert.message}
              onClose={() => hideAlert(alert.id)}
              autoHideMs={alert.autoHideMs}
            />
          );
        }

        if (alert.type === "error") {
          return (
            <ErrorAlert
              key={alert.id}
              visible={true}
              message={alert.message}
              onClose={() => hideAlert(alert.id)}
              autoHideMs={alert.autoHideMs}
            />
          );
        }

        return null;
      })}
    </>
  );
}
