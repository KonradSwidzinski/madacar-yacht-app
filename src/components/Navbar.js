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
            Yacht Charter
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            {currentUser ? (
              <>
                {!isAdmin && (
                  <Button 
                    color="inherit"
                    onClick={() => navigate('/my-bookings')}
                  >
                    My Bookings
                  </Button>
                )}
                {isAdmin && (
                  <Button 
                    color="inherit"
                    onClick={() => navigate('/admin')}
                  >
                    Admin
                  </Button>
                )}
                <Button 
                  color="inherit"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button 
                  color="inherit"
                  onClick={() => navigate('/login')}
                >
                  Login
                </Button>
                <Button 
                  color="inherit"
                  onClick={() => navigate('/signup')}
                >
                  Sign Up
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