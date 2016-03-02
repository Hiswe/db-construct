# db-construct

Small static website for db-construct

## prerequisite

- [node js >= 5](https://nodejs.org/en/)

## build

### first and always step 

```
npm install
```

### make a release

```
npm run release
```

### dev server

```
npm run release
```

### heroku configuration

`apps` -> `yourapp` -> `settings` -> `reveal config vars`

- dbconstruct_emailOptions__to `Name <email@adress.com>`
- dbconstruct_emailTransport__host `smtp host (mail.gandi.net)`
- dbconstruct_emailTransport__port `smtp port (25)`
- dbconstruct_emailTransport__auth__user `smtp login`
- dbconstruct_emailTransport__auth__pass `smtp password`
