export const isScreenSmall = (currentWidth: string) => {
  return ['xs', 'sm', 'md'].includes(currentWidth);
};

export const isScreenLarge = (currentWidth: string) => {
  return ['lg'].includes(currentWidth);
};
