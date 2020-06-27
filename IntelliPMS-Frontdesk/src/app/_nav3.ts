import { INavData } from '@coreui/angular';

export const adminNavItems: INavData[] = [
  {
    name: 'Dashboard',
    url: '/dashboard',
    icon: 'icon-speedometer',
  },
  {
    title: true,
    name: 'Admin',
  },
  {
    name: 'Hotels',
    url: '/admin-duties',
    icon: 'icon-settings',
    children: [
      {
        name: 'Create Hotel',
        url: '/admin-duties/create-hotel',
        icon: 'icon-plus'
      },
      {
        name: 'View Hotels',
        url: '/admin-duties/hotels-list',
        icon: 'icon-bag'
      }
    ]
  },
  {
    name: 'Employees',
    url: '/admin-duties',
    icon: 'icon-settings',
    children: [
      {
        name: 'Create Employee',
        url: '/admin-duties/create-employee',
        icon: 'icon-user-follow'
      },
      {
        name: 'View Employees',
        url: '/admin-duties/employees',
        icon: 'icon-people'
      },
      {
        name: 'Employees Control',
        url: '/admin-duties/employees-control',
        icon: 'icon-equalizer'
      }
    ]
  }
];
