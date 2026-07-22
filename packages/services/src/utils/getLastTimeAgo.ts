export const getLastTimeAgo = (date: string) => {
  const now = new Date();
  const then = new Date(date);

  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(weeks / 4);
  const years = Math.floor(months / 12);

  if (years > 0) return `${years} year ago`;
  if (months > 0) return `${months} month ago`;
  if (weeks > 0) return `${weeks} week ago`;
  if (days > 0) return `${days} day ago`;
  if (hours > 0) return `${hours} hour ago`;
  if (minutes > 0) return `${minutes} m ago`;

  return `just now`;
};
