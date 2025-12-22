import { Box, Typography, Divider, Chip, useTheme } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SchoolIcon from '@mui/icons-material/School';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import { tokens } from '../theme';
import Modal from './Modal';

const UserDetailsModal = ({ open, onClose, user }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  if (!user) return null;

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
      title="User Details"
      maxWidth="sm"
    >
      <Box>
        {/* Profile Header */}
        <Box display="flex" alignItems="center" gap="20px" mb="30px" pb="20px" borderBottom={`1px solid ${colors.grey[700]}`}>
          <Box
            sx={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: colors.primary[300],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px',
            }}
          >
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.name}
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
            <Typography variant="h4" color={colors.grey[100]} fontWeight="bold" mb="5px">
              {user.name || 'Unknown User'}
            </Typography>
            <Chip
              label={user.role || 'N/A'}
              sx={{
                backgroundColor:
                  user.role === 'teacher'
                    ? colors.greenAccent[600]
                    : user.role === 'student'
                    ? colors.blueAccent[600]
                    : colors.grey[700],
                color: colors.grey[100],
                fontWeight: 'bold',
              }}
            />
          </Box>
        </Box>

        {/* Basic Information */}
        <Typography variant="h6" color={colors.grey[100]} mb="15px" fontWeight="bold">
          Basic Information
        </Typography>
        <InfoRow icon={<EmailIcon />} label="Email" value={user.email} />
        <InfoRow
          icon={<CalendarTodayIcon />}
          label="Joined"
          value={user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
        />

        {/* Role-Specific Information */}
        {user.role === 'teacher' && (
          <>
            <Divider sx={{ my: '20px', borderColor: colors.grey[700] }} />
            <Typography variant="h6" color={colors.grey[100]} mb="15px" fontWeight="bold">
              Teacher Information
            </Typography>
            <InfoRow
              icon={<MusicNoteIcon />}
              label="Instruments"
              value={Array.isArray(user.instruments) ? user.instruments.join(', ') : user.instruments || 'N/A'}
            />
            {user.experience && (
              <InfoRow icon={<SchoolIcon />} label="Experience" value={user.experience} />
            )}
            {user.rate && (
              <InfoRow
                icon={<SchoolIcon />}
                label="Rate"
                value={`$${user.rate}/hour`}
                color={colors.greenAccent[500]}
              />
            )}
            {user.specialties && user.specialties.length > 0 && (
              <Box mb="15px">
                <Typography variant="body2" color={colors.grey[400]} sx={{ mb: '10px' }}>
                  Specialties
                </Typography>
                <Box display="flex" flexWrap="wrap" gap="10px">
                  {user.specialties.map((specialty, index) => (
                    <Chip
                      key={index}
                      label={specialty}
                      size="small"
                      sx={{
                        backgroundColor: colors.blueAccent[600],
                        color: colors.grey[100],
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </>
        )}

        {user.role === 'student' && (
          <>
            <Divider sx={{ my: '20px', borderColor: colors.grey[700] }} />
            <Typography variant="h6" color={colors.grey[100]} mb="15px" fontWeight="bold">
              Student Information
            </Typography>
            <InfoRow
              icon={<MusicNoteIcon />}
              label="Instruments Learning"
              value={Array.isArray(user.instruments) ? user.instruments.join(', ') : user.instruments || 'N/A'}
            />
            {user.skillLevel && (
              <InfoRow icon={<SchoolIcon />} label="Skill Level" value={user.skillLevel} />
            )}
            {user.weeklyGoal && (
              <InfoRow
                icon={<SchoolIcon />}
                label="Weekly Practice Goal"
                value={`${user.weeklyGoal} minutes`}
              />
            )}
          </>
        )}

        {/* Location */}
        {user.location && (
          <>
            <Divider sx={{ my: '20px', borderColor: colors.grey[700] }} />
            <InfoRow icon={<LocationOnIcon />} label="Location" value={user.location} />
          </>
        )}

        {/* About */}
        {user.about && (
          <>
            <Divider sx={{ my: '20px', borderColor: colors.grey[700] }} />
            <Typography variant="h6" color={colors.grey[100]} mb="15px" fontWeight="bold">
              About
            </Typography>
            <Typography variant="body1" color={colors.grey[200]} sx={{ lineHeight: 1.6 }}>
              {user.about}
            </Typography>
          </>
        )}
      </Box>
    </Modal>
  );
};

export default UserDetailsModal;

