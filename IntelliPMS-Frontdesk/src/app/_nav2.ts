import { INavData } from '@coreui/angular';

export const frontDeskNavItems: INavData[] = [
  {
    name: 'Dashboard',
    url: '/dashboard',
    icon: 'icon-speedometer',
  },
  {
    name: 'Rooms',
    url: '/room',
    icon: 'icon-home',
    children: [
      {
        name: 'Checkin',
        url: '/room/checkin',
        icon: 'icon-login'
      },
      {
        name: 'Checkout',
        url: '/room/checkout',
        icon: 'icon-logout'
      },
      {
        name: 'Make Reservation',
        url: '/room/make-reservation',
        icon: 'icon-plus'
      },
      {
        name: 'Reservations',
        url: '/room/reservations',
        icon: 'icon-close'
      }
    ]
  },
  {
    name: 'Guests',
    url: '/guests',
    icon: 'icon-people',
    children: [
      {
        name: 'Guests List',
        url: '/guests/guests-list',
        icon: 'icon-list'
      }
    ]
  },
  {
    name: 'Cash Register',
    url: '/cash-register',
    icon: 'icon-notebook',
    children: [
      {
        name: 'Manage Cash Register',
        url: '/cash-register/manage-cash-register',
        icon: 'icon-book-open'
      }
    ]
  },
  {
    name: 'Customer Service',
    url: '/customer-service',
    icon: 'icon-cup',
    children: [
      {
        name: 'Laundry Service',
        url: '/customer-service/laundry-service',
        icon: 'icon-layers'
      },
      {
        name: 'House Keeping',
        url: '/customer-service/housekeeping',
        icon: 'icon-loop'
      },
      {
        name: 'Room Service',
        url: '/customer-service/room-service',
        icon: 'icon-drawer'
      },
      {
        name: 'Issues/Comments',
        url: '/customer-service/issues-comments',
        icon: 'icon-volume-1'
      }
    ]
  },
  {
    name: 'Reports',
    url: '/reports',
    icon: 'icon-chart',
    children: [
      {
        name: 'Overview',
        url: '/reports/overview',
        icon: 'icon-bag'
      },
      {
        name: 'Graphical Overview',
        url: '/reports/graphical-overview',
        icon: 'icon-graph'
      },
      {
        name: 'Rooms Report',
        url: '/reports/rooms-report',
        icon: 'icon-directions'
      },
      {
        name: 'Revenues Report',
        url: '/reports/revenues-report',
        icon: 'icon-wallet'
      }
    ]
  }
];
