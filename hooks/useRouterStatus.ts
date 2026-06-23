import { useNavigation } from "react-router-dom";

export const useRouterStatus = () => {
  const { state } = useNavigation();

  if (state === "loading" || state === "submitting") {
    return "loading";
  }

  return "idle";
};
