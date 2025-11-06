// donation-form.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyDjPD3ELSzyF6xbnRYrCU30MBZO78-ozfs",
  authDomain: "login-final-18101.firebaseapp.com",
  databaseURL: "https://login-final-18101-default-rtdb.firebaseio.com",
  projectId: "login-final-18101",
  storageBucket: "login-final-18101.appspot.com",
  messagingSenderId: "355958069407",
  appId: "1:355958069407:web:7f1d794071d7c846b4aaaa"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

const donationForm = document.getElementById("donationForm");
const formStatus = document.getElementById("formStatus");

// ✅ Retrieve selected NGO data from localStorage
const selectedNGO = JSON.parse(localStorage.getItem("selectedNGO"));
console.log("Selected NGO:", selectedNGO);

donationForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  formStatus.textContent = "Submitting donation...";
  formStatus.style.color = "gray";

  const donorName = document.getElementById("donorName").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const donationType = document.getElementById("donationType").value;
  const address = document.getElementById("address").value.trim();
  const message = document.getElementById("message").value.trim();
  const fileInput = document.getElementById("donationPhoto");
  let imageUrl = "";

  try {
    // ✅ Upload photo if provided
    if (fileInput.files.length > 0) {
      const file = fileInput.files[0];
      const storageRef = ref(storage, `donationPhotos/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      imageUrl = await getDownloadURL(storageRef);
    }

    // ✅ Add document to Firestore
    await addDoc(collection(db, "donations"), {
      ngoId: selectedNGO.uid,              // ✅ NGO reference (important!)
      ngoName: selectedNGO.name,
      donorName,
      email,
      phone,
      donationType,
      address,
      message,
      imageUrl,
      status: "Pending",                   // Default status
      timestamp: serverTimestamp()
    });

    formStatus.textContent = "✅ Donation submitted successfully!";
    formStatus.style.color = "green";
    donationForm.reset();

  } catch (error) {
    console.error("Error adding donation:", error);
    formStatus.textContent = "❌ Error submitting donation. Check console.";
    formStatus.style.color = "red";
  }
});
