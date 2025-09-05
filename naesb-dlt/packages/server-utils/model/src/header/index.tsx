export interface IDrawerNavItem {
  label: string;
  route: string;
  active: boolean;
}

export interface IDrawerNavItems {
  navItems: IDrawerHeaders[];
}

export interface IDrawerHeaders {
  label: string;
  route?: string;
  active: boolean;
  subMenu?: IDrawerNavItem[];
}