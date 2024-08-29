# PROJECT FRONTEND

This frontend web application is designed to provide a user interface for interacting with the backend services of [Project Name]. It is built using HTML, CSS, and JavaScript, with React for the UI and FontAwesome for icons. The app fetches data from a backend API and displays it dynamically on the page.

## Requirements

For development, you will only need Node.js installed on your environment.
And please use the appropriate [Editorconfig](http://editorconfig.org/) plugin for your Editor (not mandatory).

### Node

[Node](http://nodejs.org/) is really easy to install & now includes [NPM](https://npmjs.org/).
You should be able to run the following command after the installation procedure
below.

    $ node --version
    v0.10.24

    $ npm --version
    1.3.21

#### Node installation on OS X

You will need to use a Terminal. On OS X, you can find the default terminal in
`/Applications/Utilities/Terminal.app`.

Please install [Homebrew](http://brew.sh/) if it's not already done with the following command.

    $ ruby -e "$(curl -fsSL https://raw.github.com/Homebrew/homebrew/go/install)"

If everything went fine, you should run

    brew install node

#### Node installation on Linux

    sudo apt-get install python-software-properties
    sudo add-apt-repository ppa:chris-lea/node.js
    sudo apt-get update
    sudo apt-get install nodejs

#### Node installation on Windows

Just go on [official Node.js website](http://nodejs.org/) & grab the installer.
Also, be sure to have `git` available in your PATH, `npm` might need it.

## Install

    $ git clone https://github.com/heohak/ORNet-frontend.git
    $ cd PROJECT
    $ npm install

### Configure app

Edit `config.js` if needed:

- backend API - `http://localhost:8080` when run on your own computer,
  or `http://*(IP)*:8080` if using a different IP.

## Start & watch

    $ npm start

## Simple build for production

    $ npm run build

## Update sources

Some packages usages might change so you should run `npm prune` & `npm install` often.
A common way to update is by doing:

    $ git pull
    $ npm prune
    $ npm install

To run those 3 commands you can just do:

    $ npm run pull

**Note:** Unix users can just link the `git-hooks/post-merge`.

## Project Structure

- `src/`: Contains the source code for the frontend app.
    - `components/`: React components used throughout the app.
    - `css/`: CSS files for styling the app.
    - `config.js`: Configuration file for the API endpoint.


## Languages & tools

### HTML


### JavaScript

- [React](https://react.dev/) is used for UI.

### CSS

- [Fontawesome](https://fontawesome.com/) is used for some icons
- [Bootstrap](https://getbootstrap.com/) for responsive design

## Dependencies


- React: A JavaScript library for building user interfaces (^18.3.1).
- React DOM: Provides DOM-specific methods for React (^18.3.1).
- React Router DOM: Handles routing in the application (^6.24.0).
- React Bootstrap: A React implementation of the Bootstrap framework (^2.10.4).
- Bootstrap: CSS framework for responsive web design (^5.3.3).
- Axios: A promise-based HTTP client for making requests (^1.7.2).
- React Select: A flexible select input control (^5.8.0).
- React Datetime: A date and time picker component (^3.2.0).
- FontAwesome & React FontAwesome: Icon toolkit and React components for icons (^6.6.0, ^0.2.2).
- React Icons: Popular icons as React components (^5.2.1).
- Moment.js: Date manipulation library (^2.30.1).
- Cors: Middleware for handling cross-origin resource sharing (^2.8.5).
- Testing Libraries: Utilities for testing React components, including DOM and user events (^13.4.0, ^5.17.0, ^13.5.0).
