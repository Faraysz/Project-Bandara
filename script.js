// ==============================
// ELEMENTS
// ==============================
const searchInput = document.getElementById("flightSearch");
const searchButton = document.querySelector("button.bg-orange-500");
const btnDep = document.getElementById("btn-dep");
const btnArr = document.getElementById("btn-arr");

// ==============================
// AVIATIONSTACK CONFIG
// ==============================
const API_KEY = "85bde295121e40bb68973f647b605c17";
const API_URL = "http://api.aviationstack.com/v1/flights";

// ==============================
// GLOBAL STATE
// ==============================
let currentFlights = [];
let currentType = "departure";

// ==============================
// FETCH FLIGHT DATA
// ==============================
async function fetchFlights(type = "departure") {
    try {
        currentType = type;

        const response = await fetch(
            `${API_URL}?access_key=${API_KEY}&limit=20`
        );

        const data = await response.json();

        if (!data.data || data.data.length === 0) {
            console.error("Data kosong:", data);
            document.getElementById("flight-table").innerHTML = `
                <tr>
                    <td colspan="6" class="p-4 text-center text-gray-500">
                        Data penerbangan tidak tersedia
                    </td>
                </tr>`;
            return;
        }

        currentFlights = data.data;
        renderFlightTable(currentFlights, currentType);

    } catch (error) {
        console.error("Gagal mengambil data flight:", error);
    }
}

// ==============================
// RENDER TABLE
// ==============================
function renderFlightTable(flights, type) {
    const table = document.getElementById("flight-table");
    table.innerHTML = "";

    if (flights.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="6" class="p-4 text-center text-gray-500">
                    Data tidak ditemukan
                </td>
            </tr>`;
        return;
    }

    flights.forEach(flight => {
        const time = type === "departure"
            ? flight.departure?.scheduled
            : flight.arrival?.scheduled;

        const city = type === "departure"
            ? flight.departure?.airport
            : flight.arrival?.airport;

        const terminal = type === "departure"
            ? flight.departure?.terminal
            : flight.arrival?.terminal;

        const gate = type === "departure"
            ? flight.departure?.gate
            : flight.arrival?.gate;

        const status = flight.flight_status
            ? flight.flight_status.toUpperCase()
            : "UNKNOWN";

        let statusClass = "status-on-time";
        if (status.includes("DELAY")) statusClass = "status-delay";
        if (status.includes("BOARD")) statusClass = "status-boarding";
        if (status.includes("LAND")) statusClass = "status-arrived";

        const row = `
            <tr class="border-b hover:bg-gray-50">
                <td class="p-4">${formatTime(time)}</td>
                <td class="p-4 font-semibold">${city || "-"}</td>
                <td class="p-4">${flight.airline?.name || "-"}</td>
                <td class="p-4 text-blue-600 font-medium">
                    ${flight.flight?.iata || "-"}
                </td>
                <td class="p-4 text-center">
                    ${terminal || "-"} / ${gate || "-"}
                </td>
                <td class="p-4 ${statusClass}">
                    ${status}
                </td>
            </tr>
        `;

        table.innerHTML += row;
    });
}

// ==============================
// SEARCH LOGIC (INI YANG TADI BELUM ADA)
// ==============================
function searchFlights() {
    const keyword = searchInput.value.trim().toLowerCase();

    if (!keyword) {
        renderFlightTable(currentFlights, currentType);
        return;
    }

    const filtered = currentFlights.filter(flight => {
        const airline = flight.airline?.name?.toLowerCase() || "";
        const flightCode = flight.flight?.iata?.toLowerCase() || "";

        const airportName = currentType === "departure"
            ? flight.departure?.airport?.toLowerCase() || ""
            : flight.arrival?.airport?.toLowerCase() || "";

        const airportIata = currentType === "departure"
            ? flight.departure?.iata?.toLowerCase() || ""
            : flight.arrival?.iata?.toLowerCase() || "";

        return (
            airline.includes(keyword) ||
            flightCode.includes(keyword) ||
            airportName.includes(keyword) ||
            airportIata.includes(keyword) // 🔥 INI YANG FIX CGK
        );
    });

    renderFlightTable(filtered, currentType);
}


// ==============================
// FORMAT JAM
// ==============================
function formatTime(datetime) {
    if (!datetime) return "-";
    const date = new Date(datetime);
    return date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit"
    });
}

// ==============================
// LANGUAGE TOGGLE
// ==============================
const langToggle = document.getElementById("langToggle");

const translations = {
    id: {
        hero: "Selamat Datang di SkyPort",
        sub: "Cari informasi penerbangan Anda secara real-time"
    },
    en: {
        hero: "Welcome to SkyPort",
        sub: "Search your flight information in real-time"
    }
};

langToggle.addEventListener("change", (e) => {
    const lang = e.target.value;
    document.getElementById("hero-title").innerText = translations[lang].hero;
    document.getElementById("hero-sub").innerText = translations[lang].sub;
});

// ==============================
// CHATBOT TOGGLE
// ==============================
const chatBtn = document.getElementById("chatbot-btn");
const chatWindow = document.getElementById("chat-window");
const closeChat = document.getElementById("close-chat");

chatBtn.addEventListener("click", () => {
    chatWindow.classList.toggle("hidden");
});

closeChat.addEventListener("click", () => {
    chatWindow.classList.add("hidden");
});

// ==============================
// TAB LOGIC
// ==============================
btnDep.addEventListener("click", () => {
    btnDep.className = "tab-active";
    btnArr.className = "tab-inactive";
    fetchFlights("departure");
});

btnArr.addEventListener("click", () => {
    btnArr.className = "tab-active";
    btnDep.className = "tab-inactive";
    fetchFlights("arrival");
});

// ==============================
// SEARCH EVENTS
// ==============================
searchButton.addEventListener("click", searchFlights);

searchInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
        searchFlights();
    }
});

// ==============================
// LOAD DEFAULT
// ==============================
document.addEventListener("DOMContentLoaded", () => {
    fetchFlights("departure");
});
