import { Box, Typography } from '@mui/joy';

export interface ContractHelpProps {
  items: Array<{ title: string; content: string }>;
}

export const ContractHelp = ({ items }: ContractHelpProps) => (
  <>
    {items.map(({ title, content }) => (
      <Box key={title} maxWidth="75vw">
        <Typography
          level="body-sm"
          sx={{ fontWeight: 'bold', color: 'text.primary', lineHeight: 2 }}
        >
          {title}
        </Typography>
        <Typography level="body-sm" sx={{ color: 'text.primary' }}>
          {content}
        </Typography>
      </Box>
    ))}
  </>
);
