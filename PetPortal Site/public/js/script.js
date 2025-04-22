// document.addEventListener('DOMContentLoaded', () => {
//     const form = document.getElementById('missingPetForm');
//     const previewContainer = document.getElementById('previewContainer');
//     const photoInput = document.getElementById('photo');
//     const shareSection = document.getElementById('shareSection');
//     const reportLink = document.getElementById('reportLink');
//     const reportIdInput = document.getElementById('reportId');

//     const reportId = generateReportId();
//     reportIdInput.value = reportId;

//     photoInput.addEventListener('change', (event) => {
//         // previewContainer.innerHTML = '';
//         const files = event.target.files;

//         for (const file of files) {
//             const reader = new FileReader();

//             reader.onload = (e) => {
//                 const img = document.createElement('img');
//                 img.src = e.target.result;
//                 img.alt = file.name;
//                 img.classList.add('preview-image'); // Add a class for styling
//                 previewContainer.appendChild(img);
//             }

//             reader.readAsDataURL(file);
//         }
//         photoInput.value = ''; // Clear input to allow re-selection
//     });

//     form.addEventListener('submit', async (event) => {
//         event.preventDefault();

//         // Step 1: Check if the user is logged in before submitting the form
//         const isLoggedIn = await checkUserLogin();

//         if (!isLoggedIn) {
//             alert("You must be logged in to submit a report.");
//             window.location.href = '/html/Login.html'; // Redirect to login page if not logged in
//             return;
//         }

//         // If logged in, proceed with form submission
//         try {
//             const formData = new FormData(form);
//             const response = await fetch('/submit-report', { 
//                 method: 'POST',
//                 body: formData
//             });

//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.message || 'Error submitting report');
//             }

//             const report = await response.json();
//             alert("Report submitted successfully!");

//             window.location.href = `/reports2.html?id=${report._id}`; // Redirect to reports2.html

//             // Optional: Disable the form after submission
//             const formElements = form.elements;
//             for (let i = 0; i < formElements.length; i++) {
//                 formElements[i].disabled = true;
//             }
//             event.target.querySelector('button[type="submit"]').style.display = 'none'; // Hide submit button

//         } catch (error) {
//             console.error('Error submitting report:', error);
//             alert(error.message); // Display error message to the user
//         }
//     });

//     window.copyLink = () => {
//         reportLink.select();
//         reportLink.setSelectionRange(0, 99999); // For mobile devices
//         navigator.clipboard.writeText(reportLink.value);
//         alert("Link copied to clipboard!");
//     }

//     function generateReportId() {
//         // In a real application, use UUIDs instead of this simple random string.
//         return Math.random().toString(36).substring(2, 15);
//     }

//     // Function to check if the user is logged in
//     async function checkUserLogin() {
//         try {
//             const response = await fetch('/check-login'); // Replace with the correct endpoint that checks login status
//             if (response.ok) {
//                 const data = await response.json();
//                 return data.loggedIn; // Ensure your backend sends this info
//             } else {
//                 return false; // User is not logged in
//             }
//         } catch (error) {
//             console.error('Error checking login status:', error);
//             return false; // If there's an error, assume not logged in
//         }
//     }
// });

// document.addEventListener("DOMContentLoaded", () => {
//     const form = document.getElementById("missingPetForm");
//     const previewContainer = document.getElementById("previewContainer");
//     const photoInput = document.getElementById("photo"); // Ensure ID matches input field
//     const reportLink = document.getElementById("reportLink");
//     const reportIdInput = document.getElementById("reportId");

//     // Check if the user is logged in before allowing form submission
//     async function checkUserLogin() {
//         try {
//             const response = await fetch("/check-profile");
//             if (response.ok) {
//                 return true; // User is logged in
//             } else {
//                 return false; // Not logged in
//             }
//         } catch (error) {
//             console.error("Error checking login status:", error);
//             return false;
//         }
//     }

//     // Handle Image Previews
//     photoInput.addEventListener("change", () => {
//         previewContainer.innerHTML = ""; // Clear previous previews
//         const files = photoInput.files;

//         for (const file of files) {
//             const reader = new FileReader();
//             reader.onload = (e) => {
//                 const img = document.createElement("img");
//                 img.src = e.target.result;
//                 img.alt = file.name;
//                 img.classList.add("preview-image"); // Add class for styling
//                 previewContainer.appendChild(img);
//             };
//             reader.readAsDataURL(file);
//         }
//     });

//     // Handle Form Submission
//     form.addEventListener("submit", async (event) => {
//         event.preventDefault();

//         const isLoggedIn = await checkUserLogin();
//         if (!isLoggedIn) {
//             alert("You must be logged in to submit a report.");
//             window.location.href = "/html/Login.html"; // Redirect to login page
//             return;
//         }

//         try {
//             const formData = new FormData(form);
//             formData.append("reportId", generateReportId()); // Ensure report ID is sent

//             const response = await fetch("/submit-report", {
//                 method: "POST",
//                 body: formData,
//             });

//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.message || "Error submitting report");
//             }

//             const report = await response.json();
//             alert("Report submitted successfully!");

//             // Generate the shareable link and show it
//             const reportUrl = `${window.location.origin}/reports2?id=${report.reportId}`;
//             reportLink.value = reportUrl;
//             document.getElementById("shareSection").style.display = "block";

//             // Redirect to reports page
//             window.location.href = reportUrl;
//         } catch (error) {
//             console.error("Error submitting report:", error);
//             alert(error.message);
//         }
//     });

//     // Copy Report Link
//     window.copyLink = () => {
//         reportLink.select();
//         navigator.clipboard.writeText(reportLink.value);
//         alert("Link copied to clipboard!");
//     };

//     function generateReportId() {
//         return Math.random().toString(36).substring(2, 15);
//     }
// });


document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("missingPetForm");
    const previewContainer = document.getElementById("previewContainer");
    const photoInput = document.getElementById("photos"); 
    const reportLink = document.getElementById("reportLink");
    const reportIdInput = document.getElementById("reportId");

    reportIdInput.value = generateReportId();

    photoInput.addEventListener("change", () => {
        previewContainer.innerHTML = ""; 
        const files = photoInput.files;

        for (const file of files) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement("img");
                img.src = e.target.result;
                img.alt = file.name;
                img.classList.add("preview-image"); 
                previewContainer.appendChild(img);
            };
            reader.readAsDataURL(file);
        }
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        try {
            const formData = new FormData(form);
            formData.append("reportId", reportIdInput.value); 

            const response = await fetch("/submit-report", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Error submitting report");
            }

            const report = await response.json();
            alert("Report submitted successfully!");

            // Generate the shareable link and show it
            const reportUrl = `${window.location.origin}/reports2?id=${report.reportId}`;
            reportLink.value = reportUrl;
            document.getElementById("shareSection").style.display = "block";

            // Redirect to reports page
            window.location.href = reportUrl;

        } catch (error) {
            console.error("Error submitting report:", error);
            alert(error.message);
        }
    });

    // Copy Report Link
    window.copyLink = () => {
        reportLink.select();
        navigator.clipboard.writeText(reportLink.value);
        alert("Link copied to clipboard!");
    };

    function generateReportId() {
        return Math.random().toString(36).substring(2, 15);
    }
});


