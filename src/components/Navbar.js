import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { currentUser, isAdmin, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <AppBar position="static">
      <Container>
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            Czarter Jachtów
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            {currentUser ? (
              <>
                {!isAdmin && (
                  <Button 
                    color="inherit"
                    onClick={() => navigate('/my-bookings')}
                  >
                    Moje Rezerwacje
                  </Button>
                )}
                {isAdmin && (
                  <Button 
                    color="inherit"
                    onClick={() => navigate('/admin')}
                  >
                    Panel Admina
                  </Button>
                )}
                <Button 
                  color="inherit"
                  onClick={handleLogout}
                >
                  Wyloguj
                </Button>
              </>
            ) : (
              <>
                <Button 
                  color="inherit"
                  onClick={() => navigate('/login')}
                >
                  Zaloguj
                </Button>
                <Button 
                  color="inherit"
                  onClick={() => navigate('/signup')}
                >
                  Zarejestruj się
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 