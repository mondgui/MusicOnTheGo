import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Typography, useTheme } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { tokens } from '../theme';

const Modal = ({ open, onClose, title, children, maxWidth = 'md', actions }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: colors.primary[400],
          color: colors.grey[100],
        },
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: colors.primary[500],
          color: colors.grey[100],
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `1px solid ${colors.grey[700]}`,
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          {title}
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{
            color: colors.grey[100],
            '&:hover': {
              backgroundColor: colors.primary[600],
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        {children}
      </DialogContent>
      {actions && (
        <DialogActions
          sx={{
            backgroundColor: colors.primary[500],
            borderTop: `1px solid ${colors.grey[700]}`,
            padding: '10px 20px',
          }}
        >
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default Modal;

