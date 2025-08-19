import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface FileMetadata {
  originalName: string;
  contentType: string;
  size: number;
}

// Extract object path from upload URL for metadata lookup
function getObjectPathFromUrl(url: string): string {
  try {
    if (url.includes('/uploads/')) {
      const pathPart = url.split('/uploads/').pop();
      return `/objects/uploads/${pathPart}`;
    }
    // Handle other URL formats if needed
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const objectPath = pathParts.slice(2).join('/'); // Skip bucket name
    return `/objects/${objectPath}`;
  } catch (error) {
    console.warn("Failed to parse object path from URL:", url, error);
    return '';
  }
}

export function useFileMetadata(fileUrl: string) {
  const objectPath = getObjectPathFromUrl(fileUrl);
  
  return useQuery<FileMetadata>({
    queryKey: ['/api/objects/metadata', objectPath],
    queryFn: async () => {
      if (!objectPath) {
        throw new Error("Invalid file URL");
      }
      return apiRequest(`/api${objectPath}/metadata`, 'GET');
    },
    enabled: !!objectPath,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

export function useMultipleFileMetadata(fileUrls: string[]) {
  const queries = fileUrls.map(url => useFileMetadata(url));
  
  return {
    data: queries.map(q => q.data),
    isLoading: queries.some(q => q.isLoading),
    errors: queries.map(q => q.error).filter(Boolean),
  };
}

// Helper function to get display filename
export function getDisplayFilename(fileUrl: string, metadata?: FileMetadata | null, index?: number): string {
  if (metadata?.originalName) {
    return metadata.originalName;
  }
  
  // Fallback to UUID filename or generic name
  const urlFilename = fileUrl.split('/').pop();
  if (urlFilename && urlFilename !== fileUrl) {
    return urlFilename;
  }
  
  return `File ${(index ?? 0) + 1}`;
}