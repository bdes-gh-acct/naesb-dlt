import { ListItem } from '@mui/material';
import { IDrawerHeaders } from '@naesb/dlt-model';
import { useHistory } from 'react-router-dom';

interface ISingleLevel {
  navItem?: IDrawerHeaders;
}

// use for single level menu items with no children.
export const SingleLevel: React.FC<ISingleLevel> = ({ navItem }) => {
  const history = useHistory();
  const handleClick = () => history.push(`${navItem?.route}`);

  return (
    <ListItem
      onClick={handleClick}
      key={navItem?.label}
      sx={{
        borderBottom: '1px solid #4E5A5C',
        width: '100%',
        fontFamily: 'Goldman, Roboto, sans-serif',
        fontSize: '16px',
        height: '100%',
        lineHeight: 1.3,
        letterSpacing: '0.05em',
        paddingTop: 0,
        // @ts-ignore
        height: '50px',
        paddingBottom: 0,
      }}
    >
      {navItem?.label}
    </ListItem>
  );
};
