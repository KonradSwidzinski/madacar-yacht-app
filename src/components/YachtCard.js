import React from 'react';
import { Card, CardContent, CardMedia, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const YachtCard = ({ yacht }) => {
  const navigate = useNavigate();

  return (
    <Card sx={{ maxWidth: 345, m: 2 }}>
      <CardMedia
        component="img"
        height="200"
        image={yacht.imageUrl}
        alt={yacht.name}
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {yacht.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {yacht.description}
        </Typography>
        <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
          ${yacht.pricePerDay}/day
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => navigate(`/yacht/${yacht.id}`)}
          >
            View Details
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default YachtCard; 