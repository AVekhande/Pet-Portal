document.addEventListener('DOMContentLoaded', () => {
    // Fetch stats
    fetch('/admin/stats')
        .then(response => response.json())
        .then(data => {
            document.getElementById('total-users').innerText = data.totalUsers;
            document.getElementById('total-missing-pets').innerText = data.totalMissingPets;
            document.getElementById('total-adoption-reports').innerText = data.totalAdoptionReports;
        })
        .catch(err => console.error('Error fetching stats:', err));

    // Fetch missing pets reports
    fetch('/admin/missing-pets')
        .then(response => response.json())
        .then(pets => {
            const tableBody = document.querySelector('#missing-pets-table tbody');
            pets.forEach(pet => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${pet.name}</td>
                    <td>${pet.breed}</td>
                    <td>${new Date(pet.lastSeen).toLocaleDateString()}</td>
                    <td>${pet.location}</td>
                    <td>
                        <button onclick="deleteReport('missing-pets', '${pet._id}')">Delete</button>
                        <button onclick="modifyReport('missing-pets', '${pet._id}')">Modify</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(err => console.error('Error fetching missing pets:', err));

    // Fetch adoption reports
    fetch('/admin/adoption-reports')
        .then(response => response.json())
        .then(reports => {
            const tableBody = document.querySelector('#adoption-reports-table tbody');
            reports.forEach(report => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${report.petName}</td>
                    <td>${report.breed}</td>
                    <td>${report.age}</td>
                    <td>${report.description}</td>
                    <td>
                        <button onclick="deleteReport('adoption-reports', '${report._id}')">Delete</button>
                        <button onclick="modifyReport('adoption-reports', '${report._id}')">Modify</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(err => console.error('Error fetching adoption reports:', err));
});

// Function to delete a report
function deleteReport(type, id) {
    fetch(`/admin/${type}/${id}`, { method: 'DELETE' })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            location.reload(); // Reload to update the table
        })
        .catch(err => console.error('Error deleting report:', err));
}

// Function to modify a report
function modifyReport(type, id) {
    const newData = prompt('Enter new data (JSON format):');
    const parsedData = JSON.parse(newData);

    fetch(`/admin/${type}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedData)
    })
    .then(response => response.json())
    .then(updatedData => {
        alert('Report updated');
        location.reload(); // Reload to reflect changes
    })
    .catch(err => console.error('Error modifying report:', err));
}
