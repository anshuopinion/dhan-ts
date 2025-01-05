import { useContext } from "react";
import Cookies from "js-cookie";
import { TourContext } from "../context/TourContext";

export const useResetTutorial = () => {
  const context = useContext(TourContext);
  const setCurrentStep = context?.setCurrentStep;
  const cookiePrefix = "tour";

  const resetTutorial = () => {
    Cookies.remove(`${cookiePrefix}-skipped`);
    if (setCurrentStep) {
      setCurrentStep(-1);
    }
    window.location.reload();
  };

  return resetTutorial;
};
