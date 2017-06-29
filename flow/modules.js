

declare module 'koa' {
  declare class Koa {
    keys: Array<string>,
    use: any,
    constructor(): void,
  }
  declare var exports: Class<Koa>
}

declare module 'koa-views' {
  declare var exports: {
    (path: string, options: object): any
  }
}

declare module 'koa-json' {
  declare var exports: {
    (): any
  }
}

declare module 'koa-onerror' {
  declare var exports: {
    (app: object): any
  }
}

declare module 'koa-bodyparser' {
  declare var exports: {
    (body: object): any
  }
}

declare module 'koa-logger' {
  declare var exports: {
    (): any
  }
}

declare module 'koa-session' {
  declare var exports: {
    (app: object): any
  }
}

declare module 'koa-static' {
  declare var exports: {
    (app: string): any
  }
}

declare module 'mysql' {
  declare var exports: any
}



