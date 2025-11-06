import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const db = getFirestore();
const ngoListDiv = document.getElementById("ngo-list");

// Function to get selected filters from a section
function getSelectedValues(sectionIndex) {
    const section = document.querySelectorAll(".filter-section")[sectionIndex];
    const checked = section.querySelectorAll("input[type='checkbox']:checked");
    return Array.from(checked).map(cb => cb.parentElement.textContent.trim());
}

// Fetch all NGOs from Firestore
async function fetchNGOs() {
    const querySnapshot = await getDocs(collection(db, "ngos"));
    const ngos = [];
    querySnapshot.forEach(doc => {
        ngos.push({ id: doc.id, ...doc.data() });
    });
    return ngos;
}

// Display NGOs
function displayNGOs(list) {
    ngoListDiv.innerHTML = "";
    if(list.length === 0) {
        ngoListDiv.innerHTML = "<p>No NGOs match your filters.</p>";
        return;
    }
    list.forEach(ngo => {
        const div = document.createElement("div");
        div.classList.add("ngo-card");
        div.innerHTML = `
            <h3>${ngo.name}</h3>
            <p><strong>Type:</strong> ${ngo.type}</p>
            <p><strong>Location:</strong> ${ngo.location}</p>
            <p><strong>Needs:</strong> ${ngo.donation_needs.join(", ")}</p>
            <p><strong>Urgency:</strong> ${ngo.urgency}</p>
        `;
        ngoListDiv.appendChild(div);
    });
}

// Filter function
async function filterNGOs() {
    const ngos = await fetchNGOs();

    const donationFilter = getSelectedValues(0);
    const orgFilter = getSelectedValues(1);
    const locationFilter = getSelectedValues(2);
    const nearbyFilter = getSelectedValues(3);
    const urgencyFilter = getSelectedValues(4);
    const otherFilter = getSelectedValues(5);

    const filtered = ngos.filter(ngo => {
        const donationMatch = donationFilter.length === 0 || donationFilter.some(f => ngo.donation_needs.includes(f));
        const orgMatch = orgFilter.length === 0 || orgFilter.includes(ngo.type);
        const locationMatch = locationFilter.length === 0 || locationFilter.includes(ngo.location);
        const nearbyMatch = nearbyFilter.length === 0 || nearbyFilter.some(f => ngo.nearby_km <= parseInt(f));
        const urgencyMatch = urgencyFilter.length === 0 || urgencyFilter.includes(ngo.urgency);
        const otherMatch = otherFilter.length === 0 || otherFilter.some(f => ngo.other?.includes(f));
        return donationMatch && orgMatch && locationMatch && nearbyMatch && urgencyMatch && otherMatch;
    });

    displayNGOs(filtered);
}

// Attach change listeners to checkboxes
document.querySelectorAll(".filter-section input[type='checkbox']").forEach(cb => {
    cb.addEventListener("change", filterNGOs);
});

// Initial load
filterNGOs();
