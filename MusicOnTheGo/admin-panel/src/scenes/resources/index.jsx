import { useState, useEffect } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { tokens } from '../../theme';
import { api } from '../../lib/api';

const Resources = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      setLoading(true);
      const data = await api('/api/resources', { auth: true });
      setResources(data || []);
    } catch (error) {
      console.error('Error loading resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      field: 'id',
      headerName: 'ID',
      flex: 0.5,
    },
    {
      field: 'title',
      headerName: 'Title',
      flex: 1,
      cellClassName: 'name-column--cell',
    },
    {
      field: 'uploadedBy',
      headerName: 'Uploaded By',
      flex: 1,
      renderCell: ({ row: { uploadedBy } }) => {
        return uploadedBy?.name || uploadedBy || 'N/A';
      },
    },
    {
      field: 'instrument',
      headerName: 'Instrument',
      flex: 0.5,
    },
    {
      field: 'level',
      headerName: 'Level',
      flex: 0.5,
    },
    {
      field: 'fileType',
      headerName: 'Type',
      flex: 0.5,
    },
    {
      field: 'assignedTo',
      headerName: 'Assigned To',
      flex: 1,
      renderCell: ({ row: { assignedTo } }) => {
        if (Array.isArray(assignedTo)) {
          return `${assignedTo.length} student(s)`;
        }
        return 'N/A';
      },
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      flex: 1,
      renderCell: ({ row: { createdAt } }) => {
        return createdAt ? new Date(createdAt).toLocaleDateString() : 'N/A';
      },
    },
  ];

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h2" color={theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900]} fontWeight="bold">
          Resources Management
        </Typography>
      </Box>
      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          '& .MuiDataGrid-root': {
            border: 'none',
          },
          '& .MuiDataGrid-cell': {
            borderBottom: 'none',
            color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900],
          },
          '& .name-column--cell': {
            color: colors.greenAccent[300],
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: theme.palette.mode === 'dark' ? colors.blueAccent[700] : colors.blueAccent[500],
            borderBottom: 'none',
            color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[100],
          },
          '& .MuiDataGrid-virtualScroller': {
            backgroundColor: theme.palette.mode === 'dark' ? colors.primary[400] : colors.grey[100],
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: 'none',
            backgroundColor: theme.palette.mode === 'dark' ? colors.blueAccent[700] : colors.blueAccent[500],
            color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[100],
          },
        }}
      >
        <DataGrid
          rows={resources.map((resource, index) => ({
            id: resource._id || resource.id || index,
            ...resource,
          }))}
          columns={columns}
          loading={loading}
          checkboxSelection
        />
      </Box>
    </Box>
  );
};

export default Resources;

