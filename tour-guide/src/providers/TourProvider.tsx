"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Box } from "@chakra-ui/react";
import { Tooltip } from "../components/Tooltip";
import { Overlay } from "../components/Overlay";
import { TourContext, TourStep } from "../context/TourContext";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { matchRoute } from "../utils/matchRoute";

interface TourProviderProps {
  children: React.ReactNode;
  steps: TourStep[];
  cookiePrefix?: string;
  cookieExpiry?: number;
}

export const TourProvider = ({
  children,
  steps,
  cookiePrefix = "tour",
  cookieExpiry = 365,
}: TourProviderProps) => {
  const [currentStep, setCurrentStep] = useState(-1);
  const [isLoaded, setIsLoaded] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [skippedSteps, setSkippedSteps] = useState<Set<string>>(new Set());
  const pathname = usePathname();

  useEffect(() => {
    const loadSkippedSteps = () => {
      const cookieData = Cookies.get(`${cookiePrefix}-skipped`);
      if (cookieData) {
        try {
          const skipped = new Set(JSON.parse(cookieData)) as any;
          setSkippedSteps(skipped);
        } catch (e) {
          console.error("Error loading skipped steps from cookie:", e);
        }
      }
    };

    loadSkippedSteps();
  }, [cookiePrefix]);

  const updateSkippedSteps = useCallback(
    (stepId: string, action: "skip" | "complete") => {
      const newSkippedSteps = new Set(skippedSteps) as any;
      if (action === "skip") {
        newSkippedSteps.add(stepId);
      } else if (action === "complete") {
        newSkippedSteps.add(stepId);
      }
      setSkippedSteps(newSkippedSteps);
      Cookies.set(`${cookiePrefix}-skipped`, JSON.stringify([...newSkippedSteps]), {
        expires: cookieExpiry,
      });
    },
    [skippedSteps, cookiePrefix, cookieExpiry]
  );

  const findNextAvailableStep = useCallback(
    (startIndex: number = 0) => {
      for (let i = startIndex; i < steps.length; i++) {
        const step = steps[i];
        if (!skippedSteps.has(step.id) && matchRoute(step.route, pathname!)) {
          return i;
        }
      }
      return -1;
    },
    [steps, skippedSteps, pathname]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      const nextStepIndex = findNextAvailableStep();
      if (nextStepIndex >= 0) {
        const targetElement = document.querySelector(steps[nextStepIndex].target);
        if (targetElement) {
          setIsLoaded(true);
          setCurrentStep(nextStepIndex);
        }
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [pathname, steps, findNextAvailableStep]);

  const updateTargetRect = useCallback(() => {
    if (currentStep >= 0) {
      const targetElement = document.querySelector(steps[currentStep].target);
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        setTargetRect(rect);
      }
    } else {
      setTargetRect(null);
    }
  }, [currentStep, steps]);

  useEffect(() => {
    updateTargetRect();
    window.addEventListener("scroll", updateTargetRect, true);
    window.addEventListener("resize", updateTargetRect);
    return () => {
      window.removeEventListener("scroll", updateTargetRect, true);
      window.removeEventListener("resize", updateTargetRect);
    };
  }, [updateTargetRect]);

  const nextStep = () => {
    if (currentStep >= 0) {
      updateSkippedSteps(steps[currentStep].id, "complete");
    }

    if (currentStep < steps.length - 1) {
      const nextStepIndex = findNextAvailableStep(currentStep + 1);
      if (nextStepIndex >= 0) {
        setCurrentStep(nextStepIndex);
      } else {
        setCurrentStep(-1);
      }
    } else {
      setCurrentStep(-1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      for (let i = currentStep - 1; i >= 0; i--) {
        if (!skippedSteps.has(steps[i].id) && matchRoute(steps[i].route, pathname!)) {
          setCurrentStep(i);
          return;
        }
      }
    }
  };

  const skipTour = () => {
    if (currentStep >= 0) {
      steps.forEach((step) => {
        updateSkippedSteps(step.id, "skip");
      });
    }
    setCurrentStep(-1);
  };

  return (
    <TourContext.Provider value={{ currentStep, nextStep, previousStep, skipTour, setCurrentStep }}>
      {children}
      {isLoaded && currentStep >= 0 && (
        <>
          <Overlay targetRect={targetRect} />
          <Tooltip
            step={steps[currentStep]}
            onNext={nextStep}
            onPrevious={previousStep}
            onSkip={skipTour}
            currentStep={currentStep}
            totalSteps={steps.length}
          />
        </>
      )}
      <Box
        as="style"
        dangerouslySetInnerHTML={{
          __html: `
          .tour-highlight {
            position: relative;
            z-index: 40;
            box-shadow: 0 0 0 4px var(--chakra-colors-blue-200);
            border-radius: var(--chakra-radii-md);
          }
        `,
        }}
      />
    </TourContext.Provider>
  );
};
