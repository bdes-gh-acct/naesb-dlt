import { RouterProvider } from '@tanstack/router';
import { router } from 'router';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers';

const App = () => {
  return (
    <div className="App">
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <RouterProvider router={router} />
      </LocalizationProvider>
    </div>
  );
};

export default App;
