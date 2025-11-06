// ✅ ngo-dashboard.js
// Must be loaded as: <script type="module" src="ngo-dashboard.js"></script>

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

// ✅ Import EmailJS helper
import { sendEmail } from "./email-service.js";

// 🔹 Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDjPD3ELSzyF6xbnRYrCU30MBZO78-ozfs",
  authDomain: "login-final-18101.firebaseapp.com",
  databaseURL: "https://login-final-18101-default-rtdb.firebaseio.com",
  projectId: "login-final-18101",
  storageBucket: "login-final-18101.appspot.com",
  messagingSenderId: "355958069407",
  appId: "1:355958069407:web:7f1d794071d7c846b4aaaa"
};

// 🔹 Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// 🟩 Elements
const ngoCard = document.querySelector(".ngo-card");
const donationTableBody = document.querySelector("tbody");

// 🟩 Render NGO Profile Info
function renderNGOProfile(data) {
  ngoCard.innerHTML = `
    <h3>${data.name || "Not Provided"}</h3>
    <p><strong>Type:</strong> ${data.type || "N/A"}</p>
    <p><strong>Location:</strong> ${data.address || "N/A"}</p>
    <p><strong>Email:</strong> ${data.email || "N/A"}</p>
    <p><strong>Contact:</strong> ${data.contact || "N/A"}</p>
    <h4>Needs:</h4>
    <ul>${(data.needs || []).map(n => `<li>${n}</li>`).join("") || "<li>No needs listed</li>"}</ul>
    <h4>Established Year:</h4>
    <p>${data.establishedYear || "N/A"}</p>
    <h4>About:</h4>
    <p>${data.description || "No description provided."}</p>
    <button class="edit-btn" id="editBtn">Edit Info</button>
    <button class="event-btn" id="eventBtn"> Special Occasion</button>
    
  `;

  document.getElementById("editBtn").addEventListener("click", () => {
    window.location.href = "edit_profile.html";
  });
  document.getElementById("eventBtn").addEventListener("click", () => {
    window.location.href = "event-list.html";
  });
}

// 🟩 Load NGO Donation Requests
async function loadDonations(ngoId) {
  try {
    const q = query(collection(db, "donations"), where("ngoId", "==", ngoId));
    const snapshot = await getDocs(q);

    donationTableBody.innerHTML = "";

    if (snapshot.empty) {
      donationTableBody.innerHTML = `
        <tr><td colspan="6" style="text-align:center; color:gray;">No donation requests yet.</td></tr>
      `;
      return;
    }

    snapshot.forEach((docSnap) => {
      const donation = docSnap.data();
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${donation.donorName || "N/A"}</td>
        <td>${donation.donationType || "N/A"}</td>
        <td>${donation.message || "—"}</td>
        <td>${donation.email || "N/A"}<br>${donation.phone || ""}</td>
        <td>${donation.did || "—"}</td>
        <td>
          <select class="status-dropdown" data-id="${docSnap.id}">
            <option value="">-- Select Action --</option>
            <option value="accept">Accept Donation & Send ID</option>
            <option value="received">Mark as Received</option>
          </select>
          <button class="delete-btn" data-id="${docSnap.id}" title="Delete">
        🗑️
      </button>
        </td>
      `;

      donationTableBody.appendChild(row);
    });
    
    // Add dropdown listeners
    document.querySelectorAll(".status-dropdown").forEach(select => {
      select.addEventListener("change", async (e) => {
        const donationId = e.target.dataset.id;
        const action = e.target.value;
        await handleDonationAction(donationId, action);
      });
    });

  } catch (err) {
    console.error("Error fetching donations:", err);
    donationTableBody.innerHTML = `<tr><td colspan="6" style="color:red;">Error loading donations.</td></tr>`;
  }
}

// 🟩 Handle Actions (Accept / Received)
async function handleDonationAction(donationId, action) {
  const donationRef = doc(db, "donations", donationId);
  const donationSnap = await getDoc(donationRef);

  if (!donationSnap.exists()) return alert("Donation not found.");

  const donation = donationSnap.data();

  // Get NGO name for email template
  const ngoRef = doc(db, "ngos", donation.ngoId);
  const ngoSnap = await getDoc(ngoRef);
  const ngoName = ngoSnap.exists() ? ngoSnap.data().name : "NGO";

  if (action === "accept") {
    const uniqueId = "DID-" + Math.random().toString(36).substring(2, 8).toUpperCase();

    await updateDoc(donationRef, {
      status: "Accepted",
      did: uniqueId
    });

    alert(`✅ Donation accepted\nDonation ID: ${uniqueId}`);

    // ✉️ Send acceptance email
    sendEmail("template_4aytvnu", {
      name: donation.donorName,
      email: donation.email,
      ngo_name: ngoName,
      donation_id: uniqueId
    });

  } else if (action === "received") {
    await updateDoc(donationRef, {
      status: "Received"
    });

    alert(`✅ Donation marked as received`);

    // ✉️ Send thank-you email
    sendEmail("template_7gobicq", {
      name: donation.donorName,
      email: donation.email,
      ngo_name: ngoName,
      donation_id: donation.did || "N/A"
    });
  }
}

// 🟩 Auth State (Load Dashboard)
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("Please log in to access your dashboard.");
    window.location.href = "ngo-login.html";
    return;
  }

  const ngoRef = doc(db, "ngos", user.uid);
  const ngoSnap = await getDoc(ngoRef);

  if (ngoSnap.exists()) {
    renderNGOProfile(ngoSnap.data());
    loadDonations(user.uid);
  } else {
    // NGO profile does not exist → show "Set Up Profile" button
    ngoCard.innerHTML = `
      <p>No profile found. Please set up your info.</p>
      <button id="editBtn" class="edit-btn">Set Up Profile</button>
    `;
    document.getElementById("editBtn").addEventListener("click", () => {
      window.location.href = "edit_profile.html"; // relative path works
    });
  }

  // ✅ After this, also load special occasion donations
  loadSpecialDonations(user.uid);
});


// 🔹 Special Occasion Donations (Fetch + Status + Delete + Email)
async function loadSpecialDonations(ngoUid) {
  const specialTableBody = document.getElementById("specialDonationBody");
  if (!specialTableBody) return;

  specialTableBody.innerHTML = "<tr><td colspan='7'>Loading special occasion donations…</td></tr>";

  try {
    const eventDonationsRef = collection(db, "ngos", ngoUid, "event_donations");
    const snapshot = await getDocs(eventDonationsRef);

    if (snapshot.empty) {
      specialTableBody.innerHTML = "<tr><td colspan='7'>No special occasion donations yet.</td></tr>";
      return;
    }

    let rows = "";
    const seen = new Set();

    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const uniqueKey = (data.email || "") + (data.eventId || "");
      if (seen.has(uniqueKey)) return;
      seen.add(uniqueKey);

      rows += `
      <tr>
        <td>${data.event || "—"}</td>
        <td>${data.donorName || "—"}</td>
        <td>${data.type || "—"}</td>
        <td>${data.message || "—"}</td>
        <td>${data.email || "—"}<br>${data.phone || "—"}</td>
        <td>
          <select class="special-status-dropdown" data-id="${docSnap.id}">
            <option value="">-- Select Action --</option>
            <option value="sendMail">Send Mail</option>
            <option value="thankyou">Thank You</option>
          </select>
          <button class="delete-btn" data-id="${docSnap.id}" title="Delete">🗑️</button>
        </td>
      </tr>
      `;
    });

    specialTableBody.innerHTML = rows;

    // ✅ Status Dropdown Listener
    document.querySelectorAll(".special-status-dropdown").forEach(select => {
      select.addEventListener("change", async (e) => {
        const action = e.target.value;
        const docId = e.target.dataset.id;
        await handleSpecialDonationAction(ngoUid, docId, action);
        e.target.value = ""; // reset dropdown
      });
    });

    // ✅ Delete Listener
    specialTableBody.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const confirmDelete = confirm("Are you sure you want to delete this request?");
        if (!confirmDelete) return;

        const docId = btn.dataset.id;
        try {
          await deleteDoc(doc(db, "ngos", ngoUid, "event_donations", docId));
          alert("Request deleted successfully!");
          loadSpecialDonations(ngoUid); // reload table
        } catch (err) {
          console.error("Error deleting request:", err);
          alert("Failed to delete request. Try again.");
        }
      });
    });

  } catch (err) {
    console.error("Error fetching special donations:", err);
    specialTableBody.innerHTML = "<tr><td colspan='7'>Error loading data.</td></tr>";
  }
}

// 🔹 Handle Special Occasion Status Actions
async function handleSpecialDonationAction(ngoUid, docId, action) {
  if (!action) return;

  const donationRef = doc(db, "ngos", ngoUid, "event_donations", docId);
  const donationSnap = await getDoc(donationRef);
  if (!donationSnap.exists()) return alert("Donation not found.");

  const donation = donationSnap.data();

  // Get NGO name
  const ngoSnap = await getDoc(doc(db, "ngos", ngoUid));
  const ngoName = ngoSnap.exists() ? ngoSnap.data().name : "NGO";

  if (action === "sendMail") {
    await updateDoc(donationRef, { status: "Sent Mail" });
    alert("✅ Email sent to donor.");

    // ✉️ Send email via EmailJS
    sendEmail("template_9699jtn", {
      name: donation.donorName,
      email: donation.email,
      ngo_name: ngoName,
      event_name: donation.event || "Special Occasion"
    });

  } else if (action === "thankyou") {
    await updateDoc(donationRef, { status: "Thanked" });
    alert("✅ Thank you marked for donor.");

    // ✉️ Send Thank You email
    sendEmail("template_g7sfpzs", {
      name: donation.donorName,
      email: donation.email,
      ngo_name: ngoName,
      event_name: donation.event || "Special Occasion"
    });
  }

  // Reload table
  loadSpecialDonations(ngoUid);
}

// 🔹 Call inside Auth callback
onAuthStateChanged(auth, async (user) => {
  if (user) {
    loadSpecialDonations(user.uid);
  }
});
