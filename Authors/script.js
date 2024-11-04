let authors = [];
let sortDirection = {};

// Load data from the authors.json file
fetch('authors.json')
    .then(response => response.json())
    .then(data => {
        authors = data;
        populateNationalities();
        displayAuthors(authors);
    })
    .catch(error => console.error('Error loading data:', error));

// Display authors in the table
function displayAuthors(authorsList) {
    const tbody = document.getElementById('authorsBody');
    tbody.innerHTML = ''; // Clear previous content

    authorsList.forEach(author => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${author.id}</td>
            <td>${author.name}</td>
            <td>${author.birth_date}</td>
            <td>${calculateAge(author)}</td>
            <td><input type="checkbox" disabled ${author.death_date ? '' : 'checked'}></td>
            <td>${author.nationality}</td>
            <td>${getYearsActive(author)}</td>
            <td><a href="#" onclick="showBooks(${author.id})">${getBookSummary(author)}</a></td>
        `;
        tbody.appendChild(row);
    });
}

// Calculate age of author
function calculateAge(author) {
    const birthDate = new Date(author.birth_date);
    const deathDate = author.death_date ? new Date(author.death_date) : new Date();
    return deathDate.getFullYear() - birthDate.getFullYear();
}

// Get author's years active
function getYearsActive(author) {
    const startYear = Math.min(...author.bibliography.map(book => book.year));
    const endYear = author.death_date ? new Date(author.death_date).getFullYear() : new Date().getFullYear();
    return `${startYear} - ${endYear}`;
}

// Get a summary of author's books by type
function getBookSummary(author) {
    const bookCounts = author.bibliography.reduce((acc, book) => {
        acc[book.type] = (acc[book.type] || 0) + 1;
        return acc;
    }, {});
    return Object.entries(bookCounts).map(([type, count]) => `${count} ${type}${count > 1 ? 's' : ''}`).join(', ');
}

// Show book details in a modal
function showBooks(authorId) {
    const author = authors.find(a => a.id === authorId);
    document.getElementById('modalAuthorName').innerText = author.name;

    const bookList = document.getElementById('bookList');
    bookList.innerHTML = '';

    author.bibliography.sort((a, b) => b.year - a.year).forEach(book => {
        const listItem = document.createElement('li');
        listItem.innerText = `${book.name} (${book.year}) - ${book.type}`;
        bookList.appendChild(listItem);
    });

    document.getElementById('bookModal').style.display = 'block';
}

// Close the modal
function closeModal() {
    document.getElementById('bookModal').style.display = 'none';
}

// Sort the table based on a specific column
function sortTable(column) {
    const isAscending = sortDirection[column] = !sortDirection[column];
    authors.sort((a, b) => {
        const valA = typeof a[column] === 'string' ? a[column].toLowerCase() : a[column];
        const valB = typeof b[column] === 'string' ? b[column].toLowerCase() : b[column];
        return (valA > valB ? 1 : -1) * (isAscending ? 1 : -1);
    });
    displayAuthors(authors);
}

// Populate the nationality filter dropdown
function populateNationalities() {
    const nationalityFilter = document.getElementById('nationalityFilter');
    const uniqueNationalities = [...new Set(authors.map(a => a.nationality))];
    uniqueNationalities.forEach(nation => {
        const option = document.createElement('option');
        option.value = nation;
        option.textContent = nation;
        nationalityFilter.appendChild(option);
    });
}

// Apply filters based on user input
function applyFilters() {
    const nameFilter = document.getElementById('nameFilter').value.toLowerCase();
    const nationalityFilter = document.getElementById('nationalityFilter').value;
    const aliveFilter = document.getElementById('aliveFilter').checked;
    const activeYearFilter = parseInt(document.getElementById('activeYearFilter').value);

    const filteredAuthors = authors.filter(author => {
        const matchesName = author.name.toLowerCase().includes(nameFilter);
        const matchesNationality = nationalityFilter === '' || author.nationality === nationalityFilter;
        const matchesAlive = !aliveFilter || !author.death_date;
        const matchesActiveYear = isNaN(activeYearFilter) || (author.bibliography.some(book => book.year === activeYearFilter));
        return matchesName && matchesNationality && matchesAlive && matchesActiveYear;
    });
    displayAuthors(filteredAuthors);
}