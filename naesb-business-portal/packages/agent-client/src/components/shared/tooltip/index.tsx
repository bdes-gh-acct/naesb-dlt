import {
  Tooltip as JoyTooltip,
  TooltipProps,
  styled,
  tooltipClasses,
} from '@mui/joy';

export const Tooltip = styled(({ className, ...props }: TooltipProps) => (
  // @ts-ignore
  <JoyTooltip
    {...props}
    classes={{ popper: className }}
    sx={{ maxWidth: 500 }}
  />
))({
  // @ts-ignore
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: 500,
  },
});
