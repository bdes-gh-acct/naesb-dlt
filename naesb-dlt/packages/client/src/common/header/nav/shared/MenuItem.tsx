import { IDrawerHeaders, IDrawerNavItem } from '@naesb/dlt-model';
import { MultiLevel } from './MultiLevel';
import { SingleLevel } from './SingleLevel';

interface IMenuItem {
  navItems?: IDrawerHeaders;
  selectItem?: (navItem: IDrawerNavItem) => void;
  startOpen: boolean;
}

export const MenuItem: React.FC<IMenuItem> = ({
  navItems,
  selectItem,
  startOpen,
}) => {
  const hasChildren = () => {
    return navItems?.subMenu && navItems.subMenu.length > 0;
  };

  return hasChildren() ? (
    <MultiLevel
      navItem={navItems}
      selectItem={selectItem}
      startOpen={startOpen}
    />
  ) : (
    <SingleLevel navItem={navItems} />
  );
};
