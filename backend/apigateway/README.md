# Installing TypeScript

This is a skeleton app for people who want to use TypeScript in ExpressJS. A docker-compose file is included for those who want to run it in a container.

You don't have to use the docker-compose file if you're fine with installing NodeJS and NPM locally. Feel free to delete it if that's the case.

## Prerequisites
Make sure you have [NodeJS](https://nodejs.org/en/download/) installed (preferably the LTS version). This will also install `npm`. For Windows users you might consider [Chocolaty](https://chocolatey.org) and for Mac users obviously [Brew](https://brew.sh). These are both package managers that will help you install and update all kinds of packages via the CLI. Highly recommended. 

1. Open a terminal window (command prompt, git bash, powershell)
2. Check if NodeJS is installed by typing `node --version` into the terminal. It should print a line with something like `v18.18.0`.
3. Check if NPM is installed by typing  `npm --version` into the terminal. It should print a line with something like `9.8.0`.

## Instructions

1. Clone or download this repository to your computer
2. Open a terminal in the project directory.
3. Install the dependencies by running `npm install`.
4. Run `npm run dev` to start developing
5. Run `npm run start` to start the server

## Recommended VS Code Extension
 - To use the provided `.editorconfig` file, install the [EditorConfig](https://editorconfig.org/#download) plugin.
 - To use the provided `.eslintrc.cjs` file, install the [ESLint](https://eslint.org/docs/user-guide/integrations) plugin.

## Using Docker

If you're like me and you dislike NodeJS and NPM piling up heaps of folders on your pc, run TypeScript in Docker!

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop).
2. Open a terminal window (Powershell on Windows, regular command prompt will not work).
3. Clone this repository.
4. Move to this folder inside the terminal.
5. Run `docker-compose up` and open a new terminal OR run `docker-compose up -d` which allows you to work in the same terminal.
6. Follow the steps from [Instructions](#instructions) from step 4, but prefix all the commands with `docker-compose exec ts-app`.
7. Close the docker container by pressing `ctrl` + `c` or `docker-compose down`, respectively for step 5

# Design decisions

## Modules

We use ES6 module system to [import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import?retiredLocale=nl) and [export](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export) modules.

## Variables.env

We save credentials to other services in a `variables.env` file. This file is included in this template. However, it is common use not to include it in a public repository. There are some default key value pairs included to demonstrate its working.

## Ports

You can change the ports of your server via `variables.env`

## Transpile in memory
With our `npmr run` commands we do not transpile our ts files to the filesystem. This is on purpose, we choose to transpile in memory. Hot-module replacement is also in place. If your run `npm run dev` and you update your code, the server will automatically restart.

## Database connectivity
In this project [Prisma](https://www.prisma.io/docs/orm/overview/introduction/what-is-prisma) is used for Object Relation Mapping. It comes with all kind of utilities as models, seeds and migrations.