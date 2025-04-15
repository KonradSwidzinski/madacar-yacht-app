import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip,
  Stack
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PeopleOutline, StraightenOutlined, LocationOnOutlined } from '@mui/icons-material';

const YachtCard = ({ yacht }) => {
  const navigate = useNavigate();

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="img"
        height="200"
        image={yacht.imageUrl}
        alt={yacht.name}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h5" component="h2">
          {yacht.name}
        </Typography>
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {yacht.description}
        </Typography>

        <Stack spacing={1} sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PeopleOutline fontSize="small" />
            <Typography variant="body2">
              {yacht.capacity} osób
            </Typography>
          </Box>
          
          {yacht.length && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <StraightenOutlined fontSize="small" />
              <Typography variant="body2">
                {yacht.length} metrów
              </Typography>
            </Box>
          )}
          
          {yacht.location && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOnOutlined fontSize="small" />
              <Typography variant="body2">
                {yacht.location}
              </Typography>
            </Box>
          )}
        </Stack>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
          <Typography variant="h6" color="primary">
            {yacht.pricePerDay} zł/dzień
          </Typography>
          <Button 
            variant="contained" 
            size="small"
            onClick={() => navigate(`/yacht/${yacht.id}`)}
          >
            Szczegóły
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default YachtCard; 