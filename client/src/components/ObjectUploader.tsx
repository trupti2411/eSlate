import { useState } from "react";
import type { ReactNode } from "react";
import Uppy from "@uppy/core";
import { DashboardModal } from "@uppy/react";
import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";
import AwsS3 from "@uppy/aws-s3";
import type { UploadResult } from "@uppy/core";
import { Button } from "@/components/ui/button";

interface ObjectUploaderProps {
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  allowedFileTypes?: string[];
  onGetUploadParameters: () => Promise<{
    method?: string;
    url: string;
    fields?: Record<string, any>;
  }>;
  onComplete?: (
    result: UploadResult<Record<string, unknown>, Record<string, unknown>>
  ) => void;
  buttonClassName?: string;
  children: ReactNode;
}

/**
 * A file upload component that renders as a button and provides a modal interface for
 * file management.
 */
export function ObjectUploader({
  maxNumberOfFiles = 1,
  maxFileSize = 10485760, // 10MB default
  onGetUploadParameters,
  onComplete,
  buttonClassName,
  children,
}: ObjectUploaderProps) {
  const [showModal, setShowModal] = useState(false);
  const [uppy] = useState(() =>
    new Uppy({
      restrictions: {
        maxNumberOfFiles,
        maxFileSize,
      },
      autoProceed: false,
    })
      .use(AwsS3, {
        shouldUseMultipart: false,
        getUploadParameters: async (file) => {
          try {
            console.log("Getting upload parameters for file:", file.name);
            const params = await onGetUploadParameters();
            console.log("Upload parameters received:", params);

            // Handle both 'url' and 'uploadURL' property names
            const uploadUrl = params.url || params.uploadURL;
            
            if (!params || !uploadUrl) {
              console.error("Invalid upload parameters:", params);
              throw new Error("Upload URL is undefined or missing");
            }

            return {
              method: params.method || "PUT",
              url: uploadUrl,
              fields: params.fields || {},
              headers: {},
            };
          } catch (error) {
            console.error("Error getting upload parameters:", error);
            throw error;
          }
        },
      })
      .on("complete", (result) => {
        console.log("Upload complete:", result);
        onComplete?.(result);
      })
      .on("upload-error", (file, error) => {
        console.error("Upload error for file", file?.name, ":", error);
      })
  );

  return (
    <div>
      <Button onClick={() => setShowModal(true)} className={buttonClassName}>
        {children}
      </Button>

      <DashboardModal
        uppy={uppy}
        open={showModal}
        onRequestClose={() => setShowModal(false)}
        proudlyDisplayPoweredByUppy={false}
      />
    </div>
  );
}