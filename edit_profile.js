
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-storage.js";

/* ======= REPLACE with your Firebase project's config ======= */
const firebaseConfig = {
    apiKey: "AIzaSyDjPD3ELSzyF6xbnRYrCU30MBZO78-ozfs",
    authDomain: "login-final-18101.firebaseapp.com",
    databaseURL: "https://login-final-18101-default-rtdb.firebaseio.com",
    projectId: "login-final-18101",
    storageBucket: "login-final-18101.appspot.com",
    messagingSenderId: "355958069407",
    appId: "1:355958069407:web:7f1d794071d7c846b4aaaa"
};

/* =========================================================== */

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

/* ---------- Helper DOM getters (safe) ---------- */
const $ = (id) => document.getElementById(id);
const queryAll = (sel) => Array.from(document.querySelectorAll(sel));

const saveBtn = $("saveBtn");
const statusMsg = $("statusMsg");
const previewContainer = $("previewContainer");
const mediaInput = $("mediaUpload");
const otherCheckbox = $("otherCheckbox");
const otherNeedInput = $("otherNeed");

/* ---------- Live preview for selected files ---------- */
if (mediaInput && previewContainer) {
  mediaInput.addEventListener("change", (e) => {
    previewContainer.innerHTML = "";
    const files = e.target.files ?? [];
    for (const file of files) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = document.createElement("img");
        img.src = ev.target.result;
        img.style.width = "80px";
        img.style.height = "80px";
        img.style.objectFit = "cover";
        img.style.margin = "5px";
        img.style.borderRadius = "8px";
        previewContainer.appendChild(img);
      };
      reader.readAsDataURL(file);
    }
  });
}

/* ---------- Collect needs from checkboxes + other input ---------- */
function collectNeeds() {
  const needs = [];
  // checked checkboxes with name='needs'
  const checked = queryAll("input[name='needs']:checked");
  checked.forEach((cb) => {
    const v = (cb.value || "").trim();
    if (v) needs.push(v);
  });
  // include otherNeed text if provided (regardless of otherCheckbox)
  if (otherNeedInput) {
    const otherTxt = otherNeedInput.value.trim();
    if (otherTxt && !needs.includes(otherTxt)) needs.push(otherTxt);
  }
  return needs;
}

/* ---------- When loading stored needs, pre-check known ones; unknowns -> otherNeed ---------- */
function prefillNeeds(storedNeeds) {
  if (!Array.isArray(storedNeeds)) return;
  const knownBoxes = queryAll("input[name='needs']");
  const knownVals = knownBoxes.map((b) => (b.value || "").trim()).filter(Boolean);
  const unknowns = [];

  storedNeeds.forEach((n) => {
    const nt = (n || "").trim();
    if (!nt) return;
    // if matches a known checkbox, check it
    const matched = knownBoxes.find((b) => (b.value || "").trim() === nt);
    if (matched) matched.checked = true;
    else unknowns.push(nt);
  });

  if (unknowns.length > 0 && otherNeedInput) {
    otherNeedInput.value = unknowns.join(", ");
    if (otherCheckbox) otherCheckbox.checked = true;
    otherNeedInput.style.display = otherNeedInput.value ? "block" : "none";
  }
}

/* ---------- Main: wait for auth ---------- */
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    // not logged in
    alert("Please log in to continue.");
    window.location.href = "ngo-login.html";
    return;
  }

  // autofill email if field exists
  if ($("email")) $("email").value = user.email || "";

  // attempt to load existing profile
  try {
    const docRef = doc(db, "ngos", user.uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() || {};

      if ($("ngoName")) $("ngoName").value = data.name || "";
      if ($("ngoType")) $("ngoType").value = data.type || "";
      if ($("contact")) $("contact").value = data.contact || "";
      if ($("email")) $("email").value = data.email || user.email || "";
      if ($("address")) $("address").value = data.address || "";
      if ($("establishedYear")) $("establishedYear").value = data.establishedYear || "";
      if ($("description")) $("description").value = data.description || "";

      // prefill needs (handles known checkboxes + unknown into otherNeed)
      prefillNeeds(data.needs || []);

      // show saved images in preview (if any)
      if (Array.isArray(data.images) && data.images.length && previewContainer) {
        previewContainer.innerHTML = "";
        data.images.forEach((url) => {
          const img = document.createElement("img");
          img.src = url;
          img.style.width = "80px";
          img.style.height = "80px";
          img.style.objectFit = "cover";
          img.style.margin = "5px";
          img.style.borderRadius = "8px";
          previewContainer.appendChild(img);
        });
      }
    } else {
      // no existing doc — ensure email populated
      if ($("email")) $("email").value = user.email || "";
    }
  } catch (err) {
    console.error("Error reading profile:", err);
  }

  /* ---------- Save handler ---------- */
  if (!saveBtn) {
    console.error("Save button with id 'saveBtn' not found.");
    return;
  }

  saveBtn.addEventListener("click", async (ev) => {
    ev.preventDefault();
    if (statusMsg) {
      statusMsg.textContent = "Saving...";
      statusMsg.style.color = "gray";
    }

    // collect fields
    const name = ($("ngoName")?.value || "").trim();
    const type = ($("ngoType")?.value || "").trim();
    const contact = ($("contact")?.value || "").trim();
    const email = ($("email")?.value || "").trim() || user.email || "";
    const address = ($("address")?.value || "").trim();
    const establishedYear = ($("establishedYear")?.value || "").trim();
    const description = ($("description")?.value || "").trim();

    // collect needs
    const needs = collectNeeds();

    // upload images if user selected new ones
    const uploadedImageUrls = [];
    try {
      const files = mediaInput?.files ?? [];
      for (const file of files) {
        // create unique name to avoid overwriting same filename
        const filename = `${Date.now()}_${file.name}`;
        const storageRef = ref(storage, `ngoImages/${user.uid}/${filename}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        uploadedImageUrls.push(url);
      }
    } catch (uploadErr) {
      console.error("Image upload failed:", uploadErr);
      if (statusMsg) {
        statusMsg.textContent = "Image upload failed. Try again.";
        statusMsg.style.color = "red";
      }
      return; // do not proceed if uploads failed
    }

    // Prepare payload. If no new images uploaded, preserve existing ones.
    const payload = {
      uid: user.uid,
      name,
      type,
      contact,
      email,
      address,
      establishedYear,
      description,
      needs,
      updatedAt: new Date()
    };

    // preserve existing images if no new uploads
    if (uploadedImageUrls.length > 0) {
      payload.images = uploadedImageUrls;
    } else {
      // try to fetch existing images to preserve
      try {
        const existingSnap = await getDoc(doc(db, "ngos", user.uid));
        if (existingSnap.exists()) {
          const existing = existingSnap.data();
          payload.images = Array.isArray(existing.images) ? existing.images : [];
        } else {
          payload.images = [];
        }
      } catch (preserveErr) {
        console.warn("Could not preserve existing images:", preserveErr);
        payload.images = [];
      }
    }

    // write to Firestore
    try {
      await setDoc(doc(db, "ngos", user.uid), payload);
      if (statusMsg) {
        statusMsg.textContent = "✅ Profile saved successfully!";
        statusMsg.style.color = "green";
      }
      // redirect to dashboard after short delay
      setTimeout(() => {
        window.location.href = "ngo-dashboard.html";
      }, 1200);
    } catch (dbErr) {
      console.error("Failed to save profile:", dbErr);
      if (statusMsg) {
        statusMsg.textContent = "Failed to save profile. Try again.";
        statusMsg.style.color = "red";
      }
    }
  });
});
