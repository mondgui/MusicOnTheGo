import { Box, Typography, useTheme } from '@mui/material';
import { tokens } from '../theme';

const StatBox = ({ title, subtitle, icon, progress, increase }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  
  return (
    <Box width="100%" m="0 30px">
      <Box display="flex" justifyContent="space-between">
        <Box>
          {icon}
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{ color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900] }}
          >
            {title}
          </Typography>
        </Box>
      </Box>
      <Box display="flex" justifyContent="space-between" mt="2px">
        <Typography variant="h5" sx={{ color: theme.palette.mode === 'dark' ? colors.greenAccent[500] : colors.greenAccent[700] }}>
          {subtitle}
        </Typography>
        <Typography
          variant="h5"
          fontStyle="italic"
          sx={{ color: theme.palette.mode === 'dark' ? colors.greenAccent[600] : colors.greenAccent[800] }}
        >
          {increase}
        </Typography>
      </Box>
    </Box>
  );
};

export default StatBox;

