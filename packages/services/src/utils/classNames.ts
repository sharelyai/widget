export const classNames = (...args: (string | object | undefined | null | boolean)[]): string => {
  const classes: string[] = [];

  args.forEach((arg) => {
    if (!arg) return;
    if (typeof arg === 'string') {
      classes.push(arg);
    } else if (typeof arg === 'object') {
      Object.keys(arg).forEach((key) => {
        if ((arg as any)[key]) {
          classes.push(key);
        }
      });
    }
  });

  return classes.join(' ');
};
