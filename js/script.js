const API_URL = "http://localhost:3000";

const bookingForm = document.getElementById("bookingForm");
const bookingMessage = document.getElementById("bookingMessage");

function showMessage(text, type) {
  bookingMessage.textContent = text;
  bookingMessage.className = `message ${type}`;
}

bookingForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(bookingForm);
  const booking = {
    name: formData.get("name"),
    email: formData.get("email"),
    check_in: formData.get("check_in"),
    check_out: formData.get("check_out")
  };

  showMessage("Checking availability...", "info");

  try {
    const response = await fetch(`${API_URL}/book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(booking)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || "Booking failed.");
    }

    bookingForm.reset();
    showMessage("Booking created successfully.", "success");
  } catch (error) {
    showMessage(error.message, "error");
  }
});
