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
    const { mode = 'history' } = this.config;
    return mode;
  }

  get changeEvent() {
    let evt = 'popstate';
    if (this.mode == 'hash') {
      evt = 'hashchange';
    }
    return evt;
  }

  hostConnected() {
    window.addEventListener(this.changeEvent, this.onChange);
    const info = this.resolveRoute();
    if (info) {
      this.startRoute(info);
    } else {

    }
  }

  hostDisconnected() {
    window.removeEventListener(this.changeEvent, this.onChange);
  }

  onChange = () => {
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
    let path;
    if (this.mode == 'hash') {
      path = location.hash.substring(1) || '/';
    } else {
      path = location.pathname;
      const { base } = this.config;
      if (base && path.startsWith(path)) {
        path = path.substring(base.length);
      }
    }
    for (const route of this.config.routes) {
      const match = matchPath(route.path, path);
      if (match) return { route, ...match };
    }
  }

  startRoute({ route }: { route: RouteConfig; params: any; query: any }) {
    if (route.redirect) {
      const r = route.redirect();
      this.go(r)
    } else {
      this.currentRoute = route;
      this.host.requestUpdate();
    }
  }

  currentRoute?: RouteConfig;

  go(route: Route) {
    let path;
    if (typeof route == 'string') {
      path = route;
    } else if (route.name) {
      const r = this.findRouteWithName(route.name!);
      path = this.fillParams(r.path, route);
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
    if (this.mode == 'hash') {
      location.hash = path;
    } else {
      window.history.pushState(null, '', path);
      this.onChange();
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
