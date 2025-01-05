"use client";
import { createContext, useContext } from "react";

export interface TourStep {
  target: string;
  content: string;
  placement: "top" | "bottom" | "left" | "right";
  id: string;
  route: string;
}

export interface TourContextType {
  currentStep: number;
  nextStep: () => void;
  previousStep: () => void;
  skipTour: () => void;
  setCurrentStep: (step: number) => void;
}

export const TourContext = createContext<TourContextType | null>(null);

export const useTour = () => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error("useTour must be used within a TourProvider");
  }
  return context;
};
