async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const message = document.getElementById("message");

  try {
    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("token", data.token);

      message.innerText = "Giriş başarılı";
      message.style.color = "green";

      setTimeout(() => {
  window.location.href = "dashboard.html";
}, 1000);
    } else {
      message.innerText = data.message;
      message.style.color = "red";
    }

  } catch (error) {
    message.innerText = "Sunucuya bağlanılamadı";
    message.style.color = "red";
  }
}