# PROJECT FRONTEND

This is the frontend application for the CRM, built with React and styled using Bootstrap. The application interacts with backend APIs to fetch and display data dynamically. It is optimized for modern web browsers and offers a responsive UI.

## Requirements
### Node

Ensure you have Node.js installed (recommended version: >=18.x). You can verify your installation by running:
below.

    node --version
    npm --version

#### Installation
macOS:
You will need to use a Terminal. On OS X, you can find the default terminal in
`/Applications/Utilities/Terminal.app`.

Please install [Homebrew](http://brew.sh/) if it's not already done with the following command.

    $ ruby -e "$(curl -fsSL https://raw.github.com/Homebrew/homebrew/go/install)"

If everything went fine, you should run

    brew install node

Linux:

    sudo apt-get update && sudo apt-get install nodejs npm

Windows: Download from [Node.js official site](https://nodejs.org/en)

## Install

    $ git clone https://github.com/heohak/ORNet-frontend.git
    $ cd PROJECT
    $ npm install

### Configure app

Edit `config.js` and `axiosInstance.js` if needed:
baseUrl and API_BASE_URL should use the same IP/URL

- backend API - `http://localhost:8080/api` when run on your own computer,
  or `http://*(IP)*:8080/api` if using a different IP.

Make sure to have /api after the URL

-If you want the frontend application to run on a different IP or Port:
Make a new file called `.env` in the main directory and add:
HOST=IP
PORT=port

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

- `public/`:         # Static files (index.html, manifest.json, robots.txt)
- `src/`:            # Source code
    - `components/`: # React components used throughout the app.
    - `pages/`:      # Page-level components
    - `modals/`:     # Modal components
    - `config/`:     # Configuration files
    - `utils/`:      # Helper functions
    - `css/`:        # Stylesheets
    - `assets/`:     # Images and static assets
    - `App.js`:      # Main React component
    - `index.js`:    # Entry point
    - `...`
- `package.json`:    # Project dependencies
- `Dockerfile`:      # Docker configuration
- `nginx.conf`:      # Nginx config (if using Docker)
- `README.md`:       # Documentation



## Languages & tools

### HTML


### JavaScript

- [React](https://react.dev/) is used for UI.

### CSS

- [Fontawesome](https://fontawesome.com/) is used for some icons
- [Bootstrap](https://getbootstrap.com/) for responsive design

## Dependencies


- React: UI framework
- React Router DOM: Routing solution
- Axios: HTTP client
- Bootstrap & React-Bootstrap: Styling and layout
- Moment.js: Date formatting
- FontAwesome & React Icons: Icons library
Full dependencies are listed in package.json.
