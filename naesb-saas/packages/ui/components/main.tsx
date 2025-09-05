import { Box, Typography, Container, Grid, useTheme } from '@mui/joy';
import Image from 'next/image';

export const Main = () => {
  const theme = useTheme();
  return (
    <Box height="calc(100vh - 80px)">
      <Box minHeight="calc(100vh - 100px)" width="100%" zIndex={-1}>
        <Box position="absolute" width="100%" height="100%">
          <Image
            src="/gradient-background.jpg"
            alt="gradient-background"
            object-fit="cover"
            object-repeat="no-repeat"
            object-position="center center"
            fill
          />
        </Box>
        <Box
          width="100%"
          position="absolute"
          height="100%"
          display="flex"
          zIndex={0}
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          sx={{
            background: `linear-gradient(to bottom, rgba(18, 18, 18, 0.6), ${theme.palette.background.backdrop})`,
          }}
        />
      </Box>
      <Box height="100vh" width="100%" position="absolute" top={0}>
        <Box
          width="100%"
          sx={{
            paddingTop: '30vh',
            zIndex: 2,
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography level="h3" textAlign="center">
            Welcome
          </Typography>{' '}
          <Box
            mt={2}
            mb={3}
            width="50%"
            height="3px"
            sx={{ backgroundColor: 'primary.500' }}
          />
          <Box>
            <Typography
              textAlign="center"
              sx={{
                fontSize: 20,
                fontFamily: 'Inter',
                lineHeight: '24px',
                color: '#FFFFFFB3',
              }}
            >
              Register to gain access to the Natural Gas Industry, NAESB
              Standards, Trading, and more
            </Typography>
          </Box>
        </Box>
        <Container maxWidth="md" sx={{ minHeight: '100vh' }}>
          <Box
            marginTop={20}
            sx={{
              marginBottom: 1,
              display: 'flex',
              justifyContent: 'center',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography
              textAlign="center"
              level="title-md"
              sx={{
                color: '#FFFFFFB3',
              }}
            >
              CORE BENEFITS
            </Typography>
          </Box>

          <Grid
            container
            rowSpacing={4}
            columnSpacing={8}
            sx={{
              flexGrow: 1,
              paddingTop: 3,
            }}
          >
            <Grid xs={12} md={4}>
              <Typography textAlign="center" level="title-lg">
                EFFICIENT
              </Typography>
              <Typography
                textAlign="center"
                sx={{
                  fontSize: 14,
                }}
              >
                Access the most up-to-date information and standards instantly
              </Typography>
            </Grid>
            <Grid xs={12} md={4}>
              <Typography textAlign="center" level="title-lg">
                STANDARDIZED
              </Typography>
              <Typography
                textAlign="center"
                sx={{
                  fontSize: 14,
                }}
              >
                Single source of truth for business information, location
                details, and reference data
              </Typography>
            </Grid>

            <Grid xs={12} md={4}>
              <Typography textAlign="center" level="title-lg">
                SECURE
              </Typography>
              <Typography
                textAlign="center"
                sx={{
                  fontSize: 14,
                }}
              >
                Transact with known parties by verifying them in the register
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};
