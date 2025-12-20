import { useEffect } from "react";

/**
 * Custom hook to set the document title
 * @param title - The title to set (will be appended with " | CrowdFund")
 * @param deps - Optional dependencies array to trigger title update
 */
export function useDocumentTitle(title: string, deps: any[] = []) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title ? `${title} | CrowdFund` : "CrowdFund";
    
    return () => {
      document.title = previousTitle;
    };
  }, [title, ...deps]);
}
