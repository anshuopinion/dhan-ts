import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Box, Button, Text, Flex, useTheme, CloseButton } from "@chakra-ui/react";
import { TourStep } from "../context/TourContext";

interface TooltipProps {
  step: TourStep;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  currentStep: number;
  totalSteps: number;
}

export const Tooltip = ({
  step,
  onNext,
  onPrevious,
  onSkip,
  currentStep,
  totalSteps,
}: TooltipProps) => {
  const [position, setPosition] = useState<{ top: number; left: number; placement: string }>({
    top: 0,
    left: 0,
    placement: step.placement,
  });
  const theme = useTheme();

  const calculateBestPlacement = (
    targetRect: DOMRect,
    tooltipWidth: number = 320,
    tooltipHeight: number = 150
  ) => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const margin = 20;

    const spaces = {
      top: targetRect.top - margin,
      bottom: viewportHeight - targetRect.bottom - margin,
      left: targetRect.left - margin,
      right: viewportWidth - targetRect.right - margin,
    };

    const wouldOverflow = {
      top: spaces.top < tooltipHeight,
      bottom: spaces.bottom < tooltipHeight,
      left: spaces.left < tooltipWidth,
      right: spaces.right < tooltipWidth,
    };

    const preferred = step.placement;
    if (!wouldOverflow[preferred]) {
      return preferred;
    }

    const placementPriority = ["bottom", "top", "right", "left"];
    for (const placement of placementPriority) {
      // @ts-ignore
      if (!wouldOverflow[placement]) {
        return placement;
      }
    }

    return "top";
  };

  const updatePosition = useCallback(() => {
    const targetElement = document.querySelector(step.target);
    if (!targetElement) return;

    const rect = targetElement.getBoundingClientRect();
    const bestPlacement = calculateBestPlacement(rect);
    const tooltipOffset = 12;

    let tooltipTop = 0;
    let tooltipLeft = 0;

    switch (bestPlacement) {
      case "top":
        tooltipTop = rect.top - tooltipOffset + window.scrollY;
        tooltipLeft = rect.left + rect.width / 2 + window.scrollX;
        break;
      case "bottom":
        tooltipTop = rect.bottom + tooltipOffset + window.scrollY;
        tooltipLeft = rect.left + rect.width / 2 + window.scrollX;
        break;
      case "left":
        tooltipTop = rect.top + rect.height / 2 + window.scrollY;
        tooltipLeft = rect.left - tooltipOffset + window.scrollX;
        break;
      case "right":
        tooltipTop = rect.top + rect.height / 2 + window.scrollY;
        tooltipLeft = rect.right + tooltipOffset + window.scrollX;
        break;
    }

    setPosition({ top: tooltipTop, left: tooltipLeft, placement: bestPlacement });
  }, [step.target]);

  useEffect(() => {
    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [updatePosition]);

  const getPositionStyles = (placement: string) => {
    switch (placement) {
      case "top":
        return {
          transform: "translate(-50%, -100%)",
          arrowStyles: {
            bottom: "-6px",
            left: "50%",
            transform: "translateX(-50%) rotate(45deg)",
          },
        };
      case "bottom":
        return {
          transform: "translate(-50%, 12px)",
          arrowStyles: {
            top: "-6px",
            left: "50%",
            transform: "translateX(-50%) rotate(45deg)",
          },
        };
      default:
        return {
          transform: "translate(-50%, -100%)",
          arrowStyles: {
            bottom: "-6px",
            left: "50%",
            transform: "translateX(-50%) rotate(45deg)",
          },
        };
    }
  };

  const { transform, arrowStyles } = getPositionStyles(position.placement);

  return createPortal(
    <Box
      position="absolute"
      top={position.top}
      left={position.left}
      transform={transform}
      zIndex="tooltip"
      maxWidth="xs"
    >
      <Box bg="white" borderRadius="md" boxShadow="lg" p={4} position="relative">
        <CloseButton position="absolute" right={2} top={2} onClick={onSkip} size="sm" />
        <Text mb={4}>{step.content}</Text>
        <Flex justify="space-between" align="center">
          <Text fontSize="sm" color="gray.500">
            Step {currentStep + 1} of {totalSteps}
          </Text>
          <Flex gap={2}>
            <Button onClick={onPrevious} isDisabled={currentStep === 0} size="sm" variant="ghost">
              Previous
            </Button>
            <Button onClick={onNext} size="sm" colorScheme="blue">
              {currentStep === totalSteps - 1 ? "Finish" : "Next"}
            </Button>
          </Flex>
        </Flex>
        <Box position="absolute" width="3" height="3" bg="white" {...arrowStyles} boxShadow="lg" />
      </Box>
    </Box>,
    document.body
  );
};
