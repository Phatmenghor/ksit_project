// Convert File to base64
export const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Extract the base64 string without the prefix (e.g., "data:image/png;base64,")
      const base64String = reader.result as string;
      const base64Content = base64String.split(",")[1];
      resolve(base64Content);
    };
    reader.onerror = (error) => {
      reject(error);
    };
  });
};

// Extract file type from file
export const getFileExtension = (file: File): string => {
  // Extract file type from the MIME type
  const mimeType = file.type;
  // For "image/png", this will return "png"
  return mimeType.split("/")[1];
};
