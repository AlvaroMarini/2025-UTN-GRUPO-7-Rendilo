import { create } from "zustand";

type AlertType = "warning" | "error";

interface Alert {
  id: string;
  type: AlertType;
  message: string;
  autoHideMs?: number;
}

interface AlertStore {
  alerts: Alert[];
  showAlert: (type: AlertType, message: string, autoHideMs?: number) => void;
  hideAlert: (id: string) => void;
}

export const useAlertStore = create<AlertStore>((set) => ({
  alerts: [],
  showAlert: (type, message, autoHideMs) => {
    const id = Math.random().toString(36).slice(2);
    set((state) => ({ alerts: [...state.alerts, { id, type, message, autoHideMs }] }));
  },
  hideAlert: (id) => set((state) => ({ alerts: state.alerts.filter((a) => a.id !== id) })),
}));

export const showWarning = (message: string, autoHideMs?: number) => {
  useAlertStore.getState().showAlert("warning", message, autoHideMs);
};

export const showError = (message: string, autoHideMs?: number) => {
  useAlertStore.getState().showAlert("error", message, autoHideMs);
};
