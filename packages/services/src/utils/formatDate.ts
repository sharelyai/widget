export const formatDate = (
  inputDate: string,
  type?: "SHORT" | "LARGE",
): string => {
  let options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };

  if (type === "SHORT") {
    options = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
  }

  const date = new Date(inputDate);
  return date.toLocaleString("en-US", options);
};
