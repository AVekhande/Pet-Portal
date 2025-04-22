document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('adoptionForm');
    const previewContainer = document.getElementById('previewContainer');
    const photoInput = document.getElementById('photo');
    const shareSection = document.getElementById('shareSection');
    const reportLink = document.getElementById('reportLink');
    const submitButton = form.querySelector('button[type="submit"]'); // Get the submit button

    photoInput.addEventListener('change', (event) => {
        previewContainer.innerHTML = ''; // Clear previous previews
        const files = event.target.files;``

        for (const file of files) {
            const reader = new FileReader();

            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.alt = file.name;
                img.classList.add('preview-image');
                previewContainer.appendChild(img);
            };

            reader.readAsDataURL(file);
        }
        photoInput.value = ''; // Clear input to allow re-selection
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        try {
            const formData = new FormData(form);
            submitButton.disabled = true; // Disable submit button to prevent duplicate submissions
            const response = await fetch('/submit-adopt', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error submitting adoption request');
            }

            const adoption = await response.json();
            alert("Adoption request submitted successfully!");

            // Show shareable link
            const adoptionId = adoption._id;
            reportLink.value = `${window.location.origin}/adopt-view.html?id=${adoptionId}`;
            shareSection.style.display = 'block';

            // ✅ Auto-clear the form after submission
            form.reset(); 
            previewContainer.innerHTML = ''; // Clear image previews

            // ✅ Disable all form fields to prevent further edits
            Array.from(form.elements).forEach(element => element.disabled = true);

            // ✅ Hide the submit button after successful submission
            submitButton.style.display = 'none';

            // const adoptionId = adoption._id;
            // window.location.href = `/adopt-view.html?id=${adoptionId}`;

        } catch (error) {
            console.error('Error submitting adoption request:', error);
            alert(error.message);
            submitButton.disabled = false; // Re-enable button if submission fails
        }
    });

    async function checkUserLogin() {
        try {
            const response = await fetch('/check-login'); // Replace with the correct endpoint that checks login status
            if (response.ok) {
                const data = await response.json();
                return data.loggedIn; // Ensure your backend sends this info
            } else {
                return false; // User is not logged in
            }
        } catch (error) {
            console.error('Error checking login status:', error);
            return false; // If there's an error, assume not logged in
        }
    }

    window.copyLink = () => {
        reportLink.select();
        navigator.clipboard.writeText(reportLink.value);
        alert("Link copied to clipboard!");
    };
});

// document.addEventListener('DOMContentLoaded', () => {
//     const form = document.getElementById('adoptionForm');
//     const previewContainer = document.getElementById('previewContainer');
//     const photoInput = document.getElementById('photo');
//     const shareSection = document.getElementById('shareSection');
//     const reportLink = document.getElementById('reportLink');

//     photoInput.addEventListener('change', (event) => {
//         previewContainer.innerHTML = ''; // Clear previous previews
//         const files = event.target.files;

//         for (const file of files) {
//             const reader = new FileReader();

//             reader.onload = (e) => {
//                 const img = document.createElement('img');
//                 img.src = e.target.result;
//                 img.alt = file.name;
//                 img.classList.add('preview-image');
//                 previewContainer.appendChild(img);
//             };

//             reader.readAsDataURL(file);
//         }
//         photoInput.value = ''; // Clear input to allow re-selection
//     });

//     form.addEventListener('submit', async (event) => {
//         event.preventDefault();

//         try {
//             const formData = new FormData(form);
//             const response = await fetch('/submit-adopt', {
//                 method: 'POST',
//                 body: formData
//             });

//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.message || 'Error submitting adoption request');
//             }

//             const adoption = await response.json();
//             alert("Adoption request submitted successfully!");

//             // Redirect user to adopt-view.html with the new adoption ID
//             const adoptionId = adoption._id;
//             window.location.href = `/adopt-view.html?id=${adoptionId}`;

//         } catch (error) {
//             console.error('Error submitting adoption request:', error);
//             alert(error.message);
//         }
//     });

//     window.copyLink = () => {
//         reportLink.select();
//         navigator.clipboard.writeText(reportLink.value);
//         alert("Link copied to clipboard!");
//     };
// });
