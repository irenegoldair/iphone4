/* ==========================================================
   ORTHODOX EASTER & GREEK HOLIDAYS
========================================================== */

function getOrthodoxEaster(year) {
    const a = year % 4;
    const b = year % 7;
    const c = year % 19;
    const d = (19 * c + 15) % 30;
    const e = (2 * a + 4 * b - d + 34) % 7;
    const month = Math.floor((d + e + 114) / 31);
    const day = ((d + e + 114) % 31) + 1;
    return new Date(year, month - 1, day + 13);
}

function getGreekHolidays(year) {
    const easter = getOrthodoxEaster(year);
    const easterMonday = new Date(easter);
    easterMonday.setDate(easter.getDate() + 1);

    return [
        new Date(year, 0, 1),
        new Date(year, 0, 6),
        new Date(year, 2, 25),
        easterMonday,
        new Date(year, 4, 1),
        new Date(year, 7, 15),
        new Date(year, 9, 28),
        new Date(year, 11, 25),
        new Date(year, 11, 26)
    ];
}

function parseLocalDate(value) {
    if (!value) return null;
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
}

function isInvalidDate(date) {
    if (!(date instanceof Date)) return true;

    const today = new Date();
    today.setHours(0,0,0,0);
    date.setHours(0,0,0,0);

    // ❌ αυθημερόν
    if (date.getTime() === today.getTime()) return true;

    // ❌ Σάββατο / Κυριακή
    const day = date.getDay();
    if (day === 0 || day === 6) return true;

    // ❌ αργίες
    const holidays = getGreekHolidays(date.getFullYear());
    return holidays.some(h =>
        h.getDate() === date.getDate() &&
        h.getMonth() === date.getMonth()
    );
}

/* ==========================================================
   MODAL POPUP
========================================================== */

const modal = document.getElementById("modalOverlay");
const modalMessage = document.getElementById("modalMessage");
const modalClose = document.getElementById("modalClose");

function showPopup(msg) {
    modalMessage.textContent = msg;
    modal.classList.remove("hidden");
}

modalClose.addEventListener("click", () => {
    modal.classList.add("hidden");
});

/* ==========================================================
   DATE PICKER
========================================================== */

const deliveryDate = document.getElementById("deliveryDate");
const dateBar = document.querySelector(".date-bar");

if (dateBar && deliveryDate) {
    dateBar.addEventListener("click", () => {
        deliveryDate.showPicker?.();
        deliveryDate.focus();
    });
}

/* ✅ POPUP ΟΤΑΝ ΕΠΙΛΕΓΕΤΑΙ ΛΑΘΟΣ ΗΜΕΡΟΜΗΝΙΑ */
deliveryDate.addEventListener("change", () => {
    const d = parseLocalDate(deliveryDate.value);
    if (d && isInvalidDate(d)) {
        showPopup(
            "Η ημερομηνία επιλογής δεν μπορεί να είναι αυθημερών, " +
            "Σάββατο, Κυριακή ή αργία."
        );
    }
});

/* ==========================================================
   VALIDATION HELPER
========================================================== */

function validateDeliveryDate(showError) {
    if (!deliveryDate.value) {
        if (showError) showPopup("Επιλέξτε ημερομηνία παράδοσης.");
        return false;
    }

    const d = parseLocalDate(deliveryDate.value);
    if (!d || isInvalidDate(d)) {
        if (showError) {
            showPopup(
                "Η ημερομηνία επιλογής δεν μπορεί να είναι αυθημερών, " +
                "Σάββατο, Κυριακή ή αργία."
            );
        }
        return false;
    }

    return true;
}

/* ==========================================================
   PHONE VALIDATION
========================================================== */

const phone = document.getElementById("phone");
if (phone) {
    phone.addEventListener("input", () => {
        phone.value = phone.value.replace(/\D/g, "");
    });
}

/* ==========================================================
   NEW ADDRESS VALIDATION
========================================================== */

function validateNewAddressFields() {
    const fields = [
        { id: "new_name", label: "Επωνυμία / Παραλήπτης" },
        { id: "new_street", label: "Οδός & Αριθμός" },
        { id: "new_zip", label: "Τ.Κ." },
        { id: "new_city", label: "Πόλη" },
        { id: "new_region", label: "Νομός" },
        { id: "phone", label: "Τηλέφωνο επικοινωνίας" },
        { id: "new_code", label: "Κωδικός εγκατάστασης" }
    ];

    for (let f of fields) {
        const el = document.getElementById(f.id);
        if (!el || !el.value.trim()) {
            el.style.borderColor = "#ff4444";
            showPopup(`Συμπληρώστε ${f.label}.`);
            return false;
        }
        el.style.borderColor = "#444";
    }

    if (phone.value.length !== 10) {
        phone.style.borderColor = "#ff4444";
        showPopup("Το τηλέφωνο πρέπει να έχει υποχρεωτικά 10 ψηφία.");
        return false;
    }

    return true;
}

/* ==========================================================
   FORM SUBMIT — ΤΕΛΙΚΟΣ ΕΛΕΓΧΟΣ
========================================================== */

const submitForm = document.getElementById("submitForm");
const newAddressSection = document.getElementById("newAddressSection");

submitForm.addEventListener("click", (e) => {
    e.preventDefault();

    // ✅ DATE VALIDATION (POPUP)
    if (!validateDeliveryDate(true)) return;

    // ✅ DELIVERY METHOD
    const selectedRadio = document.querySelector("input[name='deliveryMethod']:checked");
    if (!selectedRadio) {
        showPopup("Επιλέξτε τρόπο παράδοσης.");
        return;
    }

    let finalAddress = "";

    if (selectedRadio.value === "ramp") {
        finalAddress = "Κισσάβου, Ασπρόπυργος 193 00";
    } else {
        if (!newAddressSection.classList.contains("hidden")) {
            if (!validateNewAddressFields()) return;
            finalAddress =
                `${new_name.value}, ${new_street.value}, ${new_zip.value} ` +
                `${new_city.value}, ${new_region.value}`;
        } else {
            finalAddress =
                "ΑΛΦΑ ΑΕ, Λεωφόρος Κηφισίας 124, 15125 Μαρούσι, Αττική";
        }
    }

    const redirect =
        `success.html?date=${encodeURIComponent(deliveryDate.value)}` +
        `&address=${encodeURIComponent(finalAddress)}`;

    window.location.href = redirect;
});