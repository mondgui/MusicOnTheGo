import { Box, Typography } from '@mui/material';
import { tokens } from '../theme';

const StatBox = ({ title, subtitle, icon, progress, increase }) => {
  const colors = tokens;
  
  return (
    <Box width="100%" m="0 30px">
      <Box display="flex" justifyContent="space-between">
        <Box>
          {icon}
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{ color: colors.grey[900] }}
          >
            {title}
          </Typography>
        </Box>
      </Box>
      <Box display="flex" justifyContent="space-between" mt="2px">
        <Typography variant="h5" sx={{ color: colors.greenAccent[700] }}>
          {subtitle}
        </Typography>
        <Typography
          variant="h5"
          fontStyle="italic"
          sx={{ color: colors.greenAccent[800] }}
        >
          {increase}
        </Typography>
      </Box>
    </Box>
  );
};

export default StatBox;

