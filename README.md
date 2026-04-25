# Apartment Booking Web App

## Folder Structure

```text
apartment-booking-app/
├── index.html
├── admin.html
├── css/
│   └── style.css
├── js/
│   ├── script.js
│   └── admin.js
├── images/
│   ├── hero.jpg
│   ├── apartment.jpg
│   ├── room.jpg
│   └── exterior.jpg
├── backend/
│   ├── server.cjs
│   ├── package.json
│   └── bookings.db
└── README.md
```

## How To Run

1. Install Node.js LTS from `https://nodejs.org`.

2. Open a terminal and start the backend:

```bash
cd apartment-booking-app/backend
npm install
npm start
```

3. Keep that terminal open. The API runs at:

```text
http://localhost:3000
```

4. Open `apartment-booking-app/index.html` in your browser for the booking page.

5. Open `apartment-booking-app/admin.html` in your browser for the admin page.

## API

- `POST /book` creates a booking
- `GET /bookings` lists bookings
- `DELETE /bookings/:id` deletes a booking

## Database

SQLite database file:

```text
backend/bookings.db
```

The backend automatically creates the `bookings` table.

https://misic097.github.io/apartment-booking/

