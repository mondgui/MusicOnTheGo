import { Box, Typography, Divider, Chip, useTheme } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';
import { tokens } from '../theme';
import Modal from './Modal';

const BookingDetailsModal = ({ open, onClose, booking }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  if (!booking) return null;

  const getStatusIcon = () => {
    switch (booking.status?.toLowerCase()) {
      case 'approved':
      case 'confirmed':
        return <CheckCircleIcon sx={{ color: colors.greenAccent[500] }} />;
      case 'pending':
        return <PendingIcon sx={{ color: colors.blueAccent[500] }} />;
      case 'rejected':
      case 'cancelled':
        return <CancelIcon sx={{ color: colors.redAccent[500] }} />;
      default:
        return <PendingIcon sx={{ color: colors.grey[500] }} />;
    }
  };

  const getStatusColor = () => {
    switch (booking.status?.toLowerCase()) {
      case 'approved':
      case 'confirmed':
        return colors.greenAccent[600];
      case 'pending':
        return colors.blueAccent[600];
      case 'rejected':
      case 'cancelled':
        return colors.redAccent[600];
      default:
        return colors.grey[700];
    }
  };

  const InfoRow = ({ icon, label, value, color = colors.grey[100] }) => (
    <Box display="flex" alignItems="center" gap="15px" mb="15px">
      <Box
        sx={{
          color: colors.greenAccent[500],
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {icon}
      </Box>
      <Box flex={1}>
        <Typography variant="body2" color={colors.grey[400]} sx={{ mb: '5px' }}>
          {label}
        </Typography>
        <Typography variant="body1" color={color} fontWeight="500">
          {value || 'N/A'}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Booking Details"
      maxWidth="sm"
    >
      <Box>
        {/* Status Header */}
        <Box display="flex" alignItems="center" gap="15px" mb="30px" pb="20px" borderBottom={`1px solid ${colors.grey[700]}`}>
          {getStatusIcon()}
          <Box>
            <Typography variant="h5" color={colors.grey[100]} fontWeight="bold" mb="5px">
              Booking Status
            </Typography>
            <Chip
              label={booking.status || 'Unknown'}
              sx={{
                backgroundColor: getStatusColor(),
                color: colors.grey[100],
                fontWeight: 'bold',
                textTransform: 'capitalize',
              }}
            />
          </Box>
        </Box>

        {/* Student Information */}
        <Typography variant="h6" color={colors.grey[100]} mb="15px" fontWeight="bold">
          Student Information
        </Typography>
        <Box display="flex" alignItems="center" gap="15px" mb="20px" p="15px" backgroundColor={colors.primary[500]} borderRadius="4px">
          <Box
            sx={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              backgroundColor: colors.primary[300],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
            }}
          >
            {booking.student?.profileImage ? (
              <img
                src={booking.student.profileImage}
                alt={booking.student.name}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              '👤'
            )}
          </Box>
          <Box>
            <Typography variant="body2" color={colors.grey[400]}>
              Student
            </Typography>
            <Typography variant="body1" color={colors.grey[100]} fontWeight="500">
              {booking.student?.name || booking.student || 'N/A'}
            </Typography>
            {booking.student?.email && (
              <Typography variant="body2" color={colors.grey[400]}>
                {booking.student.email}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Teacher Information */}
        <Typography variant="h6" color={colors.grey[100]} mb="15px" fontWeight="bold">
          Teacher Information
        </Typography>
        <Box display="flex" alignItems="center" gap="15px" mb="30px" p="15px" backgroundColor={colors.primary[500]} borderRadius="4px">
          <Box
            sx={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              backgroundColor: colors.primary[300],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
            }}
          >
            {booking.teacher?.profileImage ? (
              <img
                src={booking.teacher.profileImage}
                alt={booking.teacher.name}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              '👤'
            )}
          </Box>
          <Box>
            <Typography variant="body2" color={colors.grey[400]}>
              Teacher
            </Typography>
            <Typography variant="body1" color={colors.grey[100]} fontWeight="500">
              {booking.teacher?.name || booking.teacher || 'N/A'}
            </Typography>
            {booking.teacher?.email && (
              <Typography variant="body2" color={colors.grey[400]}>
                {booking.teacher.email}
              </Typography>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: '20px', borderColor: colors.grey[700] }} />

        {/* Booking Details */}
        <Typography variant="h6" color={colors.grey[100]} mb="15px" fontWeight="bold">
          Booking Details
        </Typography>
        <InfoRow
          icon={<CalendarTodayIcon />}
          label="Date"
          value={booking.day || booking.date ? new Date(booking.day || booking.date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }) : 'N/A'}
        />
        <InfoRow
          icon={<AccessTimeIcon />}
          label="Time Slot"
          value={
            booking.timeSlot
              ? `${booking.timeSlot.start || ''} - ${booking.timeSlot.end || ''}`
              : booking.time || 'N/A'
          }
        />
        {booking.duration && (
          <InfoRow
            icon={<AccessTimeIcon />}
            label="Duration"
            value={`${booking.duration} minutes`}
          />
        )}

        {/* Additional Information */}
        {(booking.createdAt || booking.updatedAt) && (
          <>
            <Divider sx={{ my: '20px', borderColor: colors.grey[700] }} />
            <Typography variant="h6" color={colors.grey[100]} mb="15px" fontWeight="bold">
              Timestamps
            </Typography>
            {booking.createdAt && (
              <InfoRow
                icon={<CalendarTodayIcon />}
                label="Created"
                value={new Date(booking.createdAt).toLocaleString()}
              />
            )}
            {booking.updatedAt && (
              <InfoRow
                icon={<CalendarTodayIcon />}
                label="Last Updated"
                value={new Date(booking.updatedAt).toLocaleString()}
              />
            )}
          </>
        )}

        {/* Notes or Additional Info */}
        {booking.notes && (
          <>
            <Divider sx={{ my: '20px', borderColor: colors.grey[700] }} />
            <Typography variant="h6" color={colors.grey[100]} mb="15px" fontWeight="bold">
              Notes
            </Typography>
            <Typography variant="body1" color={colors.grey[200]} sx={{ lineHeight: 1.6 }}>
              {booking.notes}
            </Typography>
          </>
        )}
      </Box>
    </Modal>
  );
};

export default BookingDetailsModal;

