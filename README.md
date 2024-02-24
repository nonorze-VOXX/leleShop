# lele shop (A.K.A the create)

## About

this is a project for "the create" shop to use.

## Developing

> [!WARNING]  
> Because this [ssl issue](https://github.com/sveltejs/kit/issues/11365),
> use node@20 to dev. \
> volta is a good command to resolve this problem.

### Volta pre setup

```bash
volta install node@20
volta install npm
```

### Setup

```bash
npm i
```

### Start code

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
