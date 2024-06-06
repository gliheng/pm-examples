import { ReactiveController, ReactiveControllerHost, TemplateResult } from 'lit';

type Route = string | {
  name: string;
  params?: Record<string, string>;
  query?: Record<string, string>;
}

interface RouteConfig {
  name?: string;
  path: string;
  redirect?: () => Route;
  render?: () => TemplateResult;
}

interface RouterConfig {
  routes: RouteConfig[],
  mode?: 'hash' | 'history',
  base?: string;
}

export class Router implements ReactiveController {
  constructor(private host: ReactiveControllerHost, private config: RouterConfig) {
    host.addController(this);
  }

  get mode() {
    const { mode = 'hash' } = this.config;
    return mode;
  }

  hostConnected() {
    if (this.mode == 'hash') {
      window.addEventListener('hashchange', this.onHashChange);
    }
    const info = this.resolveRoute();
    if (info) {
      this.startRoute(info);
    } else {

    }
  }

  hostDisconnected() {
    if (this.mode == 'hash') {
      window.removeEventListener('hashchange', this.onHashChange);
    }
  }

  onHashChange = () => {
    const info = this.resolveRoute();
    if (info) {
      this.startRoute(info);
    }
  }

  resolveRoute(): { route: RouteConfig; params: any; query: any } | undefined {
    const matchPath = (spec: string, target: string) => {
      if (spec == target) return { params: {}, query: {} };
      // const reg = spec.replace(/:(\w+)/, (r) => {

      // });
    };
    const path = location.hash.substring(1) || '/';
    for (const route of this.config.routes) {
      const match = matchPath(route.path, path);
      if (match) return { route, ...match };
    }
  }

  startRoute({ route }: { route: RouteConfig; params: any; query: any }) {
    if (route.redirect) {
      const r = route.redirect();
      this.gotoRoute(r)
    } else {
      this.currentRoute = route;
      this.host.requestUpdate();
    }
  }

  currentRoute?: RouteConfig;

  gotoRoute(route: Route) {
    if (typeof route == 'string') {
      location.hash = route;
    } else if (route.name) {
      const r = this.findRouteWithName(route.name!);
      location.hash = this.fillParams(r.path, route);
      // if (r) {
      //   this.startRoute({
      //     route: r,
      //     params: route.params,
      //     query: route.query,
      //   });
      // } else {
      //   console.error('Cannot find route for', route);
      // }
    }
  }

  fillParams(path: string, args: { params: any; query: any }) {
    return path;
  }

  findRouteWithName(name: string) {
    return this.config.routes.find(e => e.name == name);
  }

  public outlet() {
    if (this.currentRoute) {
      return this.currentRoute.render?.();
    }
  }
}
