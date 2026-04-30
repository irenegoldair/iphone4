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
    return new Date(year, month - 1, day); // ✅ τοπική ημερομηνία
}

function isInvalidDate(date) {
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
    DATE PICKER — Clickable bar
========================================================== */

const deliveryDate = document.getElementById("deliveryDate");
const dateBar = document.querySelector(".date-bar");

if (dateBar && deliveryDate) {
    dateBar.addEventListener("click", () => {
        deliveryDate.showPicker?.(); 
        deliveryDate.focus();        
        deliveryDate.click();       
    });
}


deliveryDate.addEventListener("change", () => {
    const d = parseLocalDate(deliveryDate.value);
    if (isInvalidDate(d)) {
        deliveryDate.value = "";
        showPopup("Η ημερομηνία επιλογής δεν μπορεί να είναι αυθημερών, Σάββατο, Κυριακή ή αργία.");
    }
});


/* ==========================================================
    NEW ADDRESS — SHOW / HIDE
========================================================== */
const changeAddressBtn = document.getElementById("changeAddressBtn");
const cancelNewAddress = document.getElementById("cancelNewAddress");
const newAddressSection = document.getElementById("newAddressSection");

changeAddressBtn.addEventListener("click", () => {

    const selectedRadio = document.querySelector("input[name='deliveryMethod']:checked");

    if (!selectedRadio || selectedRadio.value !== "address") {
        showPopup("Πρώτα επιλέξτε 'Παράδοση στη δηλωθείσα διεύθυνση'.");
        return;
    }

    newAddressSection.classList.remove("hidden");
});

cancelNewAddress.addEventListener("click", () => {
    newAddressSection.classList.add("hidden");
});


/* ==========================================================
    CUSTOMER SERVICE CHECKBOX
========================================================== */
const customerService = document.getElementById("customerService");
const customerServicePanel = document.getElementById("customerServicePanel");



/* ==========================================================
    PHONE VALIDATION (10 digits)
========================================================== */
const phone = document.getElementById("phone");

if (phone) {
    phone.addEventListener("input", () => {
        const cleaned = phone.value.replace(/\D/g, "");
        phone.value = cleaned;
    });
}


/* ==========================================================
    REQUIRED VALIDATION — ΜΕ ΑΝΑΦΟΡΑ ΣΕ ΚΑΘΕ ΠΕΔΙΟ
========================================================== */
function validateNewAddressFields() {

    const fieldMap = [
        { id: "new_name", label: "Επωνυμία / Παραλήπτης" },
        { id: "new_street", label: "Οδός & Αριθμός" },
        { id: "new_zip", label: "Τ.Κ." },
        { id: "new_city", label: "Πόλη" },
        { id: "new_region", label: "Νομός" },
        { id: "phone", label: "Τηλέφωνο επικοινωνίας" },
        { id: "new_code", label: "Κωδικός εγκατάστασης" }
    ];

    
    for (let f of fieldMap) {
        const el = document.getElementById(f.id);
        if (el && el.value.trim() === "") {
            el.style.borderColor = "#ff4444";
            showPopup(`Συμπληρώστε ${f.label}.`);
            return false;
        } else {
            el.style.borderColor = "#444"; 
        }
    }

    
    const phoneVal = document.getElementById("phone").value;
    if (phoneVal.length !== 10) {
        document.getElementById("phone").style.borderColor = "#ff4444";
        showPopup("Το τηλέφωνο πρέπει να έχει υποχρεωτικά 10 ψηφία.");
        return false;
    }

    return true;
}


/* ==========================================================
    DELIVERY METHOD — FIXED BEHAVIOR (radio but uncheckable)
========================================================== */

const deliveryRadios = document.querySelectorAll("input[name='deliveryMethod']");
const rampMapSection = document.getElementById("rampMapSection");
const newAddressSection2 = document.getElementById("newAddressSection");
const defaultAddress2 = document.getElementById("defaultAddress");

deliveryRadios.forEach(radio => {

   
    radio.addEventListener("click", (e) => {
        if (radio.dataset.waschecked === "true") {
            radio.checked = false;
            radio.dataset.waschecked = "false";

           
            rampMapSection.classList.add("hidden");
            newAddressSection2.classList.remove("disabled");
            newAddressSection2.classList.add("hidden");
            defaultAddress2.classList.remove("hidden");
        } else {
            
            deliveryRadios.forEach(r => r.dataset.waschecked = "false");
            radio.dataset.waschecked = "true";
        }
    });

   
    radio.addEventListener("change", () => {

        if (radio.checked && radio.value === "ramp") {
            rampMapSection.classList.remove("hidden");
            newAddressSection2.classList.add("hidden");
            newAddressSection.classList.add("hidden");
            newAddressSection2.classList.add("disabled");
            defaultAddress2.classList.add("hidden");
        }

    if (radio.checked && radio.value === "address") {
    rampMapSection.classList.add("hidden");

    newAddressSection2.classList.remove("disabled");

    // ❗ ΔΕΝ ανοίγουμε τα πεδία εδώ
    newAddressSection2.classList.add("hidden");

    defaultAddress2.classList.remove("hidden");
}
    });
});

/* ==========================================================
   FORM SUBMISSION — Redirect to success page
========================================================== */
const submitForm = document.getElementById("submitForm");

submitForm.addEventListener("click", () => {

    if (deliveryDate.value.trim() === "") {
        showPopup("Επιλέξτε ημερομηνία παράδοσης.");
        return;
    }

    
// ✅ ΑΥΤΟ ΕΙΝΑΙ ΤΟ FIX ΓΙΑ IPHONE
    const parsedDate = parseLocalDate(deliveryDate.value);

    if (!parsedDate || isInvalidDate(parsedDate)) {
        showPopup(
            "Η ημερομηνία επιλογής δεν μπορεί να είναι αυθημερών, " +
            "Σάββατο, Κυριακή ή αργία."
        );
        return;
    }

    

const selectedRadio = document.querySelector("input[name='deliveryMethod']:checked");


if (!selectedRadio) {
    showPopup("Επιλέξτε τρόπο παράδοσης.");
    return;
}


const method = selectedRadio.value;

    let finalAddress = "";

    if (method === "ramp") {
        finalAddress = "Κισσάβου, Ασπρόπυργος 193 00";
    } else {

        if (!newAddressSection.classList.contains("hidden")) {

         if (!validateNewAddressFields()) {
    return; // ❗ αφήνουμε τη function να δείξει το σωστό μήνυμα
}

            finalAddress =
                `${new_name.value}, ${new_street.value}, ${new_zip.value} ${new_city.value}, ${new_region.value}`;

        } else {

            finalAddress = "ΑΛΦΑ ΑΕ, Λεωφόρος Κηφισίας 124, 15125 Μαρούσι, Αττική";
        }
    }

    const redirect = `success.html?date=${encodeURIComponent(deliveryDate.value)}&address=${encodeURIComponent(finalAddress)}`;
    window.location.href = redirect;
});
