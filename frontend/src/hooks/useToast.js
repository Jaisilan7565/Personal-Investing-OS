import { useDispatch } from "react-redux";
import { addToast } from "../store";

export function useToast() {
  const dispatch = useDispatch();

  const show = (message, type = "info") => {
    dispatch(addToast({ type, message }));
  };

  return {
    success: (message) => show(message, "success"),
    error: (message) => show(message, "error"),
    warning: (message) => show(message, "warning"),
    info: (message) => show(message, "info"),
  };
}
