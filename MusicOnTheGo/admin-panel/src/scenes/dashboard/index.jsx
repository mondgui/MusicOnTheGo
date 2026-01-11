import { useState, useEffect, useMemo } from 'react';
import { Box, useTheme, Typography, Button, ButtonGroup } from '@mui/material';
import { tokens } from '../../theme';
import StatBox from '../../components/StatBox';
import LineChart from '../../components/LineChart';
import PieChart from '../../components/PieChart';
import BarChart from '../../components/BarChart';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SchoolIcon from '@mui/icons-material/School';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import { api } from '../../lib/api';

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens;
  const [stats, setStats] = useState({
    totalUsers: 0,
    students: 0,
    teachers: 0,
    activeUsers7Days: 0,
    activeUsers30Days: 0,
    inactiveUsers7Days: 0,
    inactiveUsers30Days: 0,
    teachersWithStudents: 0,
    teachersWithNoStudents: 0,
    avgStudentsPerTeacher: 0,
    signedUp: 0,
    completedProfile: 0,
    usersWithFirstBooking: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userGrowth, setUserGrowth] = useState([]);
  const [topInstruments, setTopInstruments] = useState([]);
  const [topLocations, setTopLocations] = useState([]);
  const [timeRange, setTimeRange] = useState('30days'); // '7days', '30days', '90days', '6months', '1year'

  useEffect(() => {
    loadDashboardStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange]);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const statsData = await api('/api/admin/stats', { 
        auth: true,
        params: { timeRange }
      });
      
      setStats({
        totalUsers: statsData.totalUsers || 0,
        students: statsData.students || 0,
        teachers: statsData.teachers || 0,
        activeUsers7Days: statsData.activeUsers7Days || 0,
        activeUsers30Days: statsData.activeUsers30Days || 0,
        inactiveUsers7Days: statsData.inactiveUsers7Days || 0,
        inactiveUsers30Days: statsData.inactiveUsers30Days || 0,
        teachersWithStudents: statsData.teachersWithStudents || 0,
        teachersWithNoStudents: statsData.teachersWithNoStudents || 0,
        avgStudentsPerTeacher: statsData.avgStudentsPerTeacher || 0,
        signedUp: statsData.signedUp || 0,
        completedProfile: statsData.completedProfile || 0,
        usersWithFirstBooking: statsData.usersWithFirstBooking || 0,
      });
      
      setUserGrowth(statsData.userGrowth || []);
      setTopInstruments(statsData.topInstruments || []);
      setTopLocations(statsData.topLocations || []);
      
      // Debug: Log location data
      console.log('Location data received:', statsData.topLocations);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      setError(error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate growth percentage
  const calculateGrowth = (current, previous) => {
    if (!previous || previous === 0) return current > 0 ? '+100%' : '0%';
    const change = ((current - previous) / previous) * 100;
    return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  // User growth timeline data
  const userGrowthData = useMemo(() => {
    if (!userGrowth || userGrowth.length === 0) return [];
    
    // Format dates based on time range
    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      if (timeRange === '1year') {
        // Monthly format: "Jan 2024"
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      } else if (timeRange === '6months') {
        // Weekly format: shorter "M/D" format for less overlap
        return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
      } else if (timeRange === '90days') {
        // For 90 days, use shorter format
        return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
      } else {
        // Daily format: "Dec 14" for 7 and 30 days
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
    };
    
    return [{
      id: 'New Users',
      color: tokens.greenAccent[500],
      data: userGrowth.map((item) => ({
        x: formatDate(item.date),
        y: item.count,
      })),
    }];
  }, [userGrowth, timeRange]);
  
  // Get data point count for chart optimization
  const dataPointCount = userGrowth?.length || 0;

  // Active vs Inactive users data
  const activeInactiveData = useMemo(() => {
    // For longer time ranges, use 30-day activity as reference
    const use30Day = ['90days', '6months', '1year'].includes(timeRange);
    const active = use30Day ? stats.activeUsers30Days : (timeRange === '7days' ? stats.activeUsers7Days : stats.activeUsers30Days);
    const inactive = use30Day ? stats.inactiveUsers30Days : (timeRange === '7days' ? stats.inactiveUsers7Days : stats.inactiveUsers30Days);
    
    return [
      {
        id: 'Active',
        label: 'Active',
        value: active,
        color: tokens.greenAccent[500],
      },
      {
        id: 'Inactive',
        label: 'Inactive',
        value: inactive,
        color: tokens.redAccent[500],
      },
    ].filter(item => item.value > 0);
  }, [stats, timeRange]);

  // Top instruments bar chart data
  const topInstrumentsData = useMemo(() => {
    return topInstruments.slice(0, 8).map(item => ({
      label: item.instrument,
      value: item.count,
    }));
  }, [topInstruments]);

  // Top locations bar chart data
  const topLocationsData = useMemo(() => {
    return topLocations.map(item => ({
      label: item.location.length > 20 ? item.location.substring(0, 20) + '...' : item.location,
      value: item.count,
      fullLabel: item.location, // Keep full label for tooltip
    }));
  }, [topLocations]);

  // User onboarding funnel data
  const onboardingFunnelData = useMemo(() => {
    return [
      {
        label: 'Signed Up',
        value: stats.signedUp,
      },
      {
        label: 'Completed Profile',
        value: stats.completedProfile,
      },
      {
        label: 'First Booking',
        value: stats.usersWithFirstBooking,
      },
    ];
  }, [stats]);

  // Calculate growth rates based on time range
  const userGrowthRate = useMemo(() => {
    if (!userGrowth || userGrowth.length === 0) return '0%';
    
    let currentPeriod = 0;
    let previousPeriod = 0;
    
    if (timeRange === '7days' || timeRange === '30days' || timeRange === '90days') {
      // For daily ranges, compare last period with previous period
      const periodLength = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 90;
      const lastPeriod = userGrowth.slice(-periodLength);
      const previousPeriodData = userGrowth.slice(-periodLength * 2, -periodLength);
      
      currentPeriod = lastPeriod.reduce((sum, day) => sum + day.count, 0);
      previousPeriod = previousPeriodData.reduce((sum, day) => sum + day.count, 0);
    } else if (timeRange === '6months') {
      // For 6 months, compare last 4 weeks with previous 4 weeks
      const last4Weeks = userGrowth.slice(-4);
      const previous4Weeks = userGrowth.slice(-8, -4);
      
      currentPeriod = last4Weeks.reduce((sum, week) => sum + week.count, 0);
      previousPeriod = previous4Weeks.reduce((sum, week) => sum + week.count, 0);
    } else if (timeRange === '1year') {
      // For 1 year, compare last 3 months with previous 3 months
      const last3Months = userGrowth.slice(-3);
      const previous3Months = userGrowth.slice(-6, -3);
      
      currentPeriod = last3Months.reduce((sum, month) => sum + month.count, 0);
      previousPeriod = previous3Months.reduce((sum, month) => sum + month.count, 0);
    }
    
    return calculateGrowth(currentPeriod, previousPeriod);
  }, [userGrowth, timeRange]);

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb="20px">
        <Typography variant="h2" color={colors.grey[900]} fontWeight="bold">
          User Analytics Dashboard
        </Typography>
        <ButtonGroup variant="outlined" size="small">
          <Button 
            onClick={() => setTimeRange('7days')}
            variant={timeRange === '7days' ? 'contained' : 'outlined'}
            sx={{
              backgroundColor: timeRange === '7days' ? colors.blueAccent[600] : 'transparent',
              color: timeRange === '7days' ? colors.grey[100] : (colors.grey[900]),
            }}
          >
            7 Days
          </Button>
          <Button 
            onClick={() => setTimeRange('30days')}
            variant={timeRange === '30days' ? 'contained' : 'outlined'}
            sx={{
              backgroundColor: timeRange === '30days' ? colors.blueAccent[600] : 'transparent',
              color: timeRange === '30days' ? colors.grey[100] : (colors.grey[900]),
            }}
          >
            30 Days
          </Button>
          <Button 
            onClick={() => setTimeRange('90days')}
            variant={timeRange === '90days' ? 'contained' : 'outlined'}
            sx={{
              backgroundColor: timeRange === '90days' ? colors.blueAccent[600] : 'transparent',
              color: timeRange === '90days' ? colors.grey[100] : (colors.grey[900]),
            }}
          >
            90 Days
          </Button>
          <Button 
            onClick={() => setTimeRange('6months')}
            variant={timeRange === '6months' ? 'contained' : 'outlined'}
            sx={{
              backgroundColor: timeRange === '6months' ? colors.blueAccent[600] : 'transparent',
              color: timeRange === '6months' ? colors.grey[100] : (colors.grey[900]),
            }}
          >
            6 Months
          </Button>
          <Button 
            onClick={() => setTimeRange('1year')}
            variant={timeRange === '1year' ? 'contained' : 'outlined'}
            sx={{
              backgroundColor: timeRange === '1year' ? colors.blueAccent[600] : 'transparent',
              color: timeRange === '1year' ? colors.grey[100] : (colors.grey[900]),
            }}
          >
            1 Year
          </Button>
        </ButtonGroup>
      </Box>

      {error && (
        <Box
          mb="20px"
          p="10px"
          backgroundColor={colors.redAccent[700]}
          borderRadius="4px"
        >
          <Typography color={colors.grey[900]}>{error}</Typography>
        </Box>
      )}

      {/* KEY METRICS ROW */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="140px"
        gap="20px"
        mb="20px"
      >
        {/* Total Users */}
        <Box
          gridColumn="span 3"
          backgroundColor={colors.grey[200]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title="Total Users"
            subtitle={stats.totalUsers}
            icon={<PeopleIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />}
            progress={0.75}
            increase={userGrowthRate}
          />
        </Box>

        {/* Students */}
        <Box
          gridColumn="span 3"
          backgroundColor={colors.grey[200]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title="Students"
            subtitle={stats.students}
            icon={<SchoolIcon sx={{ color: colors.blueAccent[600], fontSize: "26px" }} />}
            progress={stats.totalUsers > 0 ? stats.students / stats.totalUsers : 0}
            increase={calculateGrowth(stats.students, stats.totalUsers - stats.students)}
          />
        </Box>

        {/* Teachers */}
        <Box
          gridColumn="span 3"
          backgroundColor={colors.grey[200]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title="Teachers"
            subtitle={stats.teachers}
            icon={<MusicNoteIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />}
            progress={stats.totalUsers > 0 ? stats.teachers / stats.totalUsers : 0}
            increase={calculateGrowth(stats.teachers, stats.totalUsers - stats.teachers)}
          />
        </Box>

        {/* Active Users */}
        <Box
          gridColumn="span 3"
          backgroundColor={colors.grey[200]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title="Active Users"
            subtitle={['90days', '6months', '1year'].includes(timeRange) ? stats.activeUsers30Days : (timeRange === '7days' ? stats.activeUsers7Days : stats.activeUsers30Days)}
            icon={<TrendingUpIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />}
            progress={stats.totalUsers > 0 ? (['90days', '6months', '1year'].includes(timeRange) ? stats.activeUsers30Days : (timeRange === '7days' ? stats.activeUsers7Days : stats.activeUsers30Days)) / stats.totalUsers : 0}
            increase={calculateGrowth(
              ['90days', '6months', '1year'].includes(timeRange) ? stats.activeUsers30Days : (timeRange === '7days' ? stats.activeUsers7Days : stats.activeUsers30Days),
              ['90days', '6months', '1year'].includes(timeRange) ? stats.inactiveUsers30Days : (timeRange === '7days' ? stats.inactiveUsers7Days : stats.inactiveUsers30Days)
            )}
          />
        </Box>
      </Box>

      {/* SECOND ROW - ENGAGEMENT METRICS */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="140px"
        gap="20px"
        mb="20px"
      >
        {/* Profile Completion */}
        <Box
          gridColumn="span 3"
          backgroundColor={colors.grey[200]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title="Completed Profiles"
            subtitle={stats.completedProfile}
            icon={<CheckCircleIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />}
            progress={stats.totalUsers > 0 ? stats.completedProfile / stats.totalUsers : 0}
            increase={calculateGrowth(stats.completedProfile, stats.totalUsers - stats.completedProfile)}
          />
        </Box>

        {/* First Booking */}
        <Box
          gridColumn="span 3"
          backgroundColor={colors.grey[200]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title="First Booking"
            subtitle={stats.usersWithFirstBooking}
            icon={<PersonAddIcon sx={{ color: colors.blueAccent[600], fontSize: "26px" }} />}
            progress={stats.totalUsers > 0 ? stats.usersWithFirstBooking / stats.totalUsers : 0}
            increase={calculateGrowth(stats.usersWithFirstBooking, stats.totalUsers - stats.usersWithFirstBooking)}
          />
        </Box>

        {/* Teachers with Students */}
        <Box
          gridColumn="span 3"
          backgroundColor={colors.grey[200]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title="Teachers with Students"
            subtitle={stats.teachersWithStudents}
            icon={<PeopleIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />}
            progress={stats.teachers > 0 ? stats.teachersWithStudents / stats.teachers : 0}
            increase={`${stats.avgStudentsPerTeacher} avg/teacher`}
          />
        </Box>

        {/* Teachers Needing Students */}
        <Box
          gridColumn="span 3"
          backgroundColor={colors.grey[200]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title="Teachers Needing Students"
            subtitle={stats.teachersWithNoStudents}
            icon={<SchoolIcon sx={{ color: colors.redAccent[600], fontSize: "26px" }} />}
            progress={stats.teachers > 0 ? stats.teachersWithNoStudents / stats.teachers : 0}
            increase={stats.teachersWithNoStudents > 0 ? 'Needs attention' : 'All good!'}
          />
        </Box>
      </Box>

      {/* CHARTS ROW */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="300px"
        gap="20px"
        mt="20px"
      >
        {/* User Growth Timeline */}
        {userGrowthData[0]?.data.length > 0 && (
          <Box
            gridColumn="span 6"
            backgroundColor={colors.grey[200]}
            p="30px"
            borderRadius="4px"
          >
            <Typography variant="h5" fontWeight="600" color={colors.grey[900]}>
              User Growth Timeline
            </Typography>
            <Box height="250px" mt="-20px">
              <LineChart data={userGrowthData} dataPointCount={dataPointCount} />
            </Box>
          </Box>
        )}

        {/* Active vs Inactive Users */}
        {activeInactiveData.length > 0 && (
          <Box
            gridColumn="span 4"
            backgroundColor={colors.grey[200]}
            p="30px"
            borderRadius="4px"
          >
            <Typography variant="h5" fontWeight="600" color={colors.grey[900]}>
              Active vs Inactive
            </Typography>
            <Box height="280px" mt="-20px">
              <PieChart data={activeInactiveData} />
            </Box>
          </Box>
        )}

        {/* Top Instruments */}
        {topInstrumentsData.length > 0 && (
          <Box
            gridColumn="span 5"
            backgroundColor={colors.grey[200]}
            p="30px"
            borderRadius="4px"
          >
            <Typography variant="h5" fontWeight="600" color={colors.grey[900]}>
              Top Instruments
            </Typography>
            <Box height="280px" mt="-20px">
              <BarChart data={topInstrumentsData} />
            </Box>
          </Box>
        )}

        {/* Top Locations */}
        <Box
          gridColumn="span 7"
          backgroundColor={colors.grey[200]}
          p="30px"
          borderRadius="4px"
        >
          <Typography variant="h5" fontWeight="600" color={colors.grey[900]} mb="10px">
            User Distribution by Location
          </Typography>
          {topLocationsData.length > 0 ? (
            <Box height="280px" mt="-20px">
              <BarChart data={topLocationsData} />
            </Box>
          ) : (
            <Box height="280px" display="flex" alignItems="center" justifyContent="center">
              <Typography variant="body1" color={colors.grey[700]}>
                No location data available. Users need to add their location in their profile.
              </Typography>
            </Box>
          )}
        </Box>

        {/* User Onboarding Funnel */}
        {onboardingFunnelData.length > 0 && (
          <Box
            gridColumn="span 6"
            backgroundColor={colors.grey[200]}
            p="30px"
            borderRadius="4px"
          >
            <Typography variant="h5" fontWeight="600" color={colors.grey[900]} mb="10px">
              User Onboarding Funnel
            </Typography>
            <Box display="flex" flexDirection="column" gap="15px" mt="10px">
              {onboardingFunnelData.map((step, index) => {
                const percentage = stats.signedUp > 0 ? (step.value / stats.signedUp) * 100 : 0;
                return (
                  <Box key={index}>
                    <Box display="flex" justifyContent="space-between" mb="5px">
                      <Typography variant="body1" color={colors.grey[900]}>
                        {step.label}
                      </Typography>
                      <Typography variant="body1" fontWeight="bold" color={colors.grey[900]}>
                        {step.value} ({percentage.toFixed(1)}%)
                      </Typography>
                    </Box>
                    <Box
                      width="100%"
                      height="30px"
                      backgroundColor={colors.grey[300]}
                      borderRadius="4px"
                      overflow="hidden"
                      border={`1px solid ${colors.grey[400]}`}
                    >
                      <Box
                        width={`${percentage}%`}
                        height="100%"
                        backgroundColor={colors.greenAccent[600]}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        transition="width 0.3s ease"
                        sx={{
                          boxShadow: 'none',
                        }}
                      />
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" p="20px">
          <Typography color={colors.grey[900]}>Loading dashboard data...</Typography>
        </Box>
      )}
    </Box>
  );
};

export default Dashboard;
