import { generateReactHelpers } from "@uploadthing/react";

export const { useUploadThing, uploadFiles } = generateReactHelpers({
  url: "https://server-askyourpdf-5ffcda1d0ce6.herokuapp.com/api/uploadthing",
});
