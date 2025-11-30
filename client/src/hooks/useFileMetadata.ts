import React from "react";
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
    // All URLs have /uploads/ in them, so extract everything after that
    if (url.includes('/uploads/')) {
      const uploadsIndex = url.indexOf('/uploads/');
      const objectId = url.substring(uploadsIndex + '/uploads/'.length);
      // Remove any query strings
      const cleanId = objectId.split('?')[0];
      return `/objects/uploads/${cleanId}`;
    }
    // Fallback for other URL formats
    return '';
  } catch (error) {
    console.warn("Failed to parse object path from URL:", url, error);
    return '';
  }
}

export function useFileMetadata(fileUrl: string) {
  const objectPath = React.useMemo(() => {
    if (!fileUrl) return '';
    return getObjectPathFromUrl(fileUrl);
  }, [fileUrl]);
  
  return useQuery<FileMetadata>({
    queryKey: ['/api/objects/metadata', objectPath, fileUrl],
    queryFn: async () => {
      if (!objectPath || !fileUrl) {
        throw new Error("Invalid file URL");
      }
      return apiRequest(`/api${objectPath}/metadata`, 'GET');
    },
    enabled: !!objectPath && !!fileUrl,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

export function useMultipleFileMetadata(fileUrls: string[]) {
  // Create stable array with empty strings to maintain hook call order
  const stableUrls = React.useMemo(() => {
    const maxLength = Math.max(fileUrls.length, 10); // Support up to 10 files
    const paddedUrls = [...fileUrls];
    while (paddedUrls.length < maxLength) {
      paddedUrls.push(''); // Add empty strings for unused slots
    }
    return paddedUrls.slice(0, maxLength);
  }, [fileUrls]);

  // Always call the same number of hooks
  const queries = stableUrls.map(url => useFileMetadata(url));
  
  // Filter out results for empty URLs
  const validQueries = queries.slice(0, fileUrls.length);
  
  // Determine overall loading state - only while we have actual valid queries
  const hasAnyQueries = validQueries.length > 0;
  const isLoading = hasAnyQueries && validQueries.some(q => q.isLoading);
  
  return {
    data: validQueries.map((q, idx) => {
      // If query failed, return fallback object with filename from URL
      if (q.error && !q.data) {
        const fileUrl = fileUrls[idx];
        const filename = fileUrl.split('/').pop()?.split('?')[0] || `File ${idx + 1}`;
        return { originalName: filename, contentType: 'unknown', size: 0 };
      }
      return q.data;
    }),
    isLoading,
    errors: validQueries.map(q => q.error).filter(Boolean),
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