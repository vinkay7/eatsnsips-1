# Eats N Sips Website

This is a lightweight HTML, CSS, and JavaScript website for Eats N Sips Africa.

## Open Without Backend

Open `index.html` directly in a browser. The contact form will fall back to opening the user's email app with the order details addressed to `eatsnsipsafrica@gmail.com`.

## Run With Email Notifications

1. Run `npm install`.
2. Copy `.env.example` to `.env`.
3. Add the SMTP password or Gmail app password.
4. Run `npm start`.
5. Open `http://localhost:3000`.

The form will send real email notifications through the `/api/contact` endpoint.
