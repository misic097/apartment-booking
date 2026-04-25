const API_URL = "http://localhost:3000";

const bookingsTable = document.getElementById("bookingsTable");
const adminMessage = document.getElementById("adminMessage");
const refreshButton = document.getElementById("refreshBookings");

function showMessage(text, type = "info") {
  adminMessage.textContent = text;
  adminMessage.className = `message ${type}`;
}

function formatDate(value) {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function renderBookings(bookings) {
  bookingsTable.innerHTML = "";

  if (bookings.length === 0) {
    bookingsTable.innerHTML = `
      <tr>
        <td colspan="7" class="empty-cell">No bookings yet.</td>
      </tr>
    `;
    return;
  }

  bookings.forEach((booking) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${booking.id}</td>
      <td>${booking.name}</td>
      <td>${booking.email}</td>
      <td>${formatDate(booking.check_in)}</td>
      <td>${formatDate(booking.check_out)}</td>
      <td>${formatDate(booking.created_at)}</td>
      <td>
        <button class="delete-button" type="button" data-id="${booking.id}">
          Delete
        </button>
      </td>
    `;
    bookingsTable.appendChild(row);
  });
}

async function loadBookings() {
  showMessage("Loading bookings...");

  try {
    const response = await fetch(`${API_URL}/bookings`);
    const bookings = await response.json();

    if (!response.ok) {
      throw new Error(bookings.error || "Could not load bookings.");
    }

    renderBookings(bookings);
    showMessage(`${bookings.length} booking(s) loaded.`, "success");
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function deleteBooking(id) {
  try {
    const response = await fetch(`${API_URL}/bookings/${id}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || "Could not delete booking.");
    }

    showMessage("Booking deleted.", "success");
    loadBookings();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

bookingsTable.addEventListener("click", (event) => {
  const button = event.target.closest("[data-id]");
  if (!button) {
    return;
  }

  deleteBooking(button.dataset.id);
});

refreshButton.addEventListener("click", loadBookings);

loadBookings();
