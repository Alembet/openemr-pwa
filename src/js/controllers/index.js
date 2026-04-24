// Custom controllers
import NavigationController    from './navigation_controller.js';
import SearchController        from './search_controller.js';
import SidebarController       from './sidebar_controller.js';
import NotificationController  from './notification_controller.js';
import ThemeController         from './theme_controller.js';
import DataTableController     from './datatable_controller.js';
import AutocompleteController  from './autocomplete_controller.js';
import PrintController         from './print_controller.js';

// Stimulus Components (pre-built)
import Clipboard               from '@stimulus-components/clipboard';
import Dialog                  from '@stimulus-components/dialog';
import Dropdown                from '@stimulus-components/dropdown';
import Reveal                  from '@stimulus-components/reveal';
import ReadMore                from '@stimulus-components/read-more';
import AutoSubmit              from '@stimulus-components/auto-submit';
import Notification            from '@stimulus-components/notification';
import Sortable                from '@stimulus-components/sortable';

export function registerControllers(app) {
  // Custom
  app.register('navigation',    NavigationController);
  app.register('search',        SearchController);
  app.register('sidebar',       SidebarController);
  app.register('notification',  NotificationController);
  app.register('theme',         ThemeController);
  app.register('datatable',     DataTableController);
  app.register('autocomplete',  AutocompleteController);
  app.register('print',         PrintController);

  // Stimulus Components
  app.register('clipboard',          Clipboard);
  app.register('dialog',             Dialog);
  app.register('dropdown',           Dropdown);
  app.register('reveal',             Reveal);
  app.register('read-more',          ReadMore);
  app.register('auto-submit',        AutoSubmit);
  app.register('sc-notification',    Notification);
  app.register('sortable',           Sortable);
}
