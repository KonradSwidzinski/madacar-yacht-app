import React, { useEffect, useState } from 'react';
import { Container, Grid, Typography, Box, Button, Card, CardContent, CardMedia } from '@mui/material';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [yachts, setYachts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchYachts = async () => {
      try {
        const yachtsData = (await getDocs(collection(db, 'yachts'))).docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setYachts(yachtsData);
      } catch (error) {
        setError('Błąd podczas pobierania jachtów: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchYachts();
  }, []);

  if (loading) return <Container><Typography>Ładowanie...</Typography></Container>;
  if (error) return <Container><Typography color="error">Błąd: {error}</Typography></Container>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h3" component="h1" gutterBottom>
            Czarter Jachtów
          </Typography>
        </Box>
        {!currentUser && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="contained" color="primary" onClick={() => navigate('/login')}>
              Zaloguj
            </Button>
            <Button variant="outlined" color="primary" onClick={() => navigate('/signup')}>
              Zarejestruj się
            </Button>
          </Box>
        )}
      </Box>


      <Typography variant="h6" component="h2" gutterBottom>
        Dostępne Jachty
      </Typography>
      <Grid container spacing={4}>
        {yachts.map((yacht) => (
          <Grid item key={yacht.id} xs={12} sm={6} md={4}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'scale(1.02)',
                  transition: 'transform 0.2s ease-in-out'
                }
              }}
              onClick={() => navigate(`/yacht/${yacht.id}`)}
            >
              <CardMedia
                component="img"
                height="200"
                image={yacht.imageUrl || 'https://via.placeholder.com/300x200?text=Yacht+Image'}
                alt={yacht.name}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2">
                  {yacht.name}
                </Typography>
                <Typography>
                  {yacht.description?.substring(0, 100)}...
                </Typography>
                <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                  {yacht.pricePerDay} zł/dzień
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Home; 