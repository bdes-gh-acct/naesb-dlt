export const copyToClipboard = (valueToCopy: string) => {
  if (valueToCopy) {
    navigator.clipboard.writeText(valueToCopy);
  }
};
