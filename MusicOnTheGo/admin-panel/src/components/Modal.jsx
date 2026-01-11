import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { tokens } from '../theme';

const Modal = ({ open, onClose, title, children, maxWidth = 'md', actions }) => {
  const colors = tokens;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#ffffff',
          color: colors.grey[900],
          boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)',
        },
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: colors.grey[100],
          color: colors.grey[900],
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `1px solid ${colors.grey[300]}`,
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          {title}
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{
            color: colors.grey[700],
            '&:hover': {
              backgroundColor: colors.grey[200],
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
            backgroundColor: colors.grey[100],
            borderTop: `1px solid ${colors.grey[300]}`,
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

