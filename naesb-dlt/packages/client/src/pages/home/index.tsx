import { useAuth0 } from '@auth0/auth0-react';
import { Typography, Box, Container, useTheme, Grid } from '@mui/material';

export const Home = () => {
  const { isAuthenticated, isLoading } = useAuth0();
  const theme = useTheme();
  return (
    <>
      {!isLoading && !isAuthenticated && (
        <>
          <Box>
            <div
              style={{
                top: 0,
                // position: 'fixed',
                height: '85vh',
                maxHeight: '900px',
                width: '100%',
                '-webkit-background-size': 'cover',
                '-moz-background-size': 'cover',
                '-o-background-size': 'cover',
                backgroundSize: 'cover',
                background: `url(${process.env.PUBLIC_URL}/home-backdrop.jpg) no-repeat 60% 30% fixed`,
              }}
            >
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingLeft: '24px !important',
                  paddingRight: '24px !important',
                  width: '100%',
                  height: '100%',
                  background: `linear-gradient(to bottom, rgba(0, 0, 0, 0.7), ${theme.palette.background.default})`,
                }}
              >
                <Container maxWidth="md" data-aos="zoom-in">
                  <Box
                    justifyContent="center"
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                  >
                    <Typography variant="h4" align="center">
                      Welcome to the future of energy trading
                    </Typography>
                    <Box
                      mt={2}
                      mb={3}
                      width="50%"
                      height="3px"
                      sx={{ backgroundColor: 'primary.main' }}
                    />
                    <Typography
                      color="textSecondary"
                      sx={{
                        fontSize: 20,
                        fontFamily: 'Inter',
                        lineHeight: '24px',
                      }}
                      align="center"
                    >
                      Experience fast, simple, secure trading on NAESB&apos;s
                      digital trading platform powered by distributed ledger
                      technology
                    </Typography>
                  </Box>
                </Container>
              </Box>
            </div>
          </Box>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            width="100%"
            mt={10}
          >
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ marginBottom: 2 }}
            >
              Core Benefits
            </Typography>
          </Box>
          <Container maxWidth="lg" sx={{ paddingBottom: 2 }}>
            <Grid container spacing={4}>
              <Grid item md={4}>
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  flexDirection="column"
                >
                  <Typography variant="h5">Fast</Typography>
                  <Typography align="center">
                    Updates propogate across the network in real time
                  </Typography>
                </Box>
              </Grid>
              <Grid item md={4}>
                <Box
                  display="flex"
                  justifyContent="center"
                  flexDirection="column"
                  alignItems="center"
                >
                  <Typography variant="h5">Efficient</Typography>
                  <Typography align="center">
                    Smart contracts automate trade processes, reducing manual
                    effort and response times
                  </Typography>
                </Box>
              </Grid>
              <Grid item md={4}>
                <Box
                  display="flex"
                  justifyContent="center"
                  flexDirection="column"
                  alignItems="center"
                >
                  <Typography variant="h5">Secure</Typography>
                  <Typography align="center">
                    Decentralized infrastructure and strong encryption protect
                    assets from ransomware and other cyber attacks
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Container>
        </>
      )}
      {/* <ThemeProvider mode="dark">
        <Box px={6} py={6}>
          <Typography variant="h6" sx={{ color: 'text.primary' }}>
            Dashboard
          </Typography>
        </Box>
      </ThemeProvider>
      <Box px={6}>
        <Card sx={{ boxShadow: 'none' }}>
          <CardHeader
            title="Wallets"
            titleTypographyProps={{
              variant: 'h6',
            }}
          />
          <CardContent>
            <Box height={400}></Box>
          </CardContent>

        </Card>
      </Box> */}
    </>
  );
};
