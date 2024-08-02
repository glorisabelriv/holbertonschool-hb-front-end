document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('login-form')) {
        setupLogin();
    } else if (document.getElementById('places-list')) {
        setupIndex();
    } else if (document.getElementById('place-details')) {
        setupPlaceDetails();
    } else if (document.getElementById('review-form')) {
        setupAddReview();
    }
});

function setupLogin() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            try {
                const response = await loginUser(email, password);
                if (response.ok) {
                    const data = await response.json();
                    document.cookie = `token=${data.access_token}; path=/`;
                    window.location.href = 'index.html';
                } else {
                    alert('Login failed: ' + response.statusText);
                }
            } catch (error) {
                console.error('Error during login:', error);
                alert('An error occurred. Please try again later.');
            }
        });
    }
}

async function loginUser(email, password) {
    return await fetch('https://your-api-url/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });
}

function setupIndex() {
    checkAuthentication();

    const countryFilter = document.getElementById('country-filter');
    if (countryFilter) {
        countryFilter.addEventListener('change', filterPlaces);
    }
}

function checkAuthentication() {
    const token = getCookie('token');
    const loginLink = document.getElementById('login-link');

    if (!token) {
        loginLink.style.display = 'block';
    } else {
        loginLink.style.display = 'none';
        fetchPlaces(token);
    }
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

async function fetchPlaces(token) {
    try {
        const response = await fetch('https://your-api-url/places', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const places = await response.json();
            displayPlaces(places);
        } else {
            console.error('Failed to fetch places:', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching places:', error);
    }
}

function displayPlaces(places) {
    const placesList = document.getElementById('places-list');
    placesList.innerHTML = '';

    places.forEach(place => {
        const placeCard = document.createElement('div');
        placeCard.className = 'place-card';
        placeCard.innerHTML = `
            <img src="${place.image}" class="place-image" alt="${place.name}">
            <h3>${place.name}</h3>
            <p>${place.description}</p>
            <p>${place.location}</p>
            <button class="details-button" onclick="viewPlaceDetails('${place.id}')">View Details</button>
        `;
        placesList.appendChild(placeCard);
    });
}

function filterPlaces() {
    const selectedCountry = document.getElementById('country-filter').value;
    const placesList = document.getElementById('places-list');
    const places = placesList.getElementsByClassName('place-card');

    for (let place of places) {
        const location = place.querySelector('p:nth-child(4)').innerText;
        if (selectedCountry === 'all' || location.includes(selectedCountry)) {
            place.style.display = 'block';
        } else {
            place.style.display = 'none';
        }
    }
}

function viewPlaceDetails(placeId) {
    window.location.href = `place.html?id=${placeId}`;
}

function setupPlaceDetails() {
    const placeId = getPlaceIdFromURL();
    checkAuthenticationForPlaceDetails(placeId);
}

function getPlaceIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

function checkAuthenticationForPlaceDetails(placeId) {
    const token = getCookie('token');
    const addReviewSection = document.getElementById('add-review');

    if (!token) {
        addReviewSection.style.display = 'none';
    } else {
        addReviewSection.style.display = 'block';
        fetchPlaceDetails(token, placeId);
    }
}

async function fetchPlaceDetails(token, placeId) {
    try {
        const response = await fetch(`https://your-api-url/places/${placeId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const place = await response.json();
            displayPlaceDetails(place);
        } else {
            console.error('Failed to fetch place details:', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching place details:', error);
    }
}

function displayPlaceDetails(place) {
    const placeDetails = document.getElementById('place-details');
    placeDetails.innerHTML = '';

    const placeCard = document.createElement('div');
    placeCard.className = 'place-card';
    placeCard.innerHTML = `
        <h3>${place.name}</h3>
        <p>${place.description}</p>
        <p>${place.location}</p>
        ${place.images.map(image => `<img src="${image}" class="place-image" alt="${place.name}">`).join('')}
    `;
    placeDetails.appendChild(placeCard);
}

function setupAddReview() {
    const token = checkAuthenticationForAddReview();
    const placeId = getPlaceIdFromURL();

    const reviewForm = document.getElementById('review-form');
    if (reviewForm) {
        reviewForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const reviewText = document.getElementById('review-text').value;
            try {
                const response = await submitReview(token, placeId, reviewText);
                if (response.ok) {
                    alert('Review submitted successfully!');
                    reviewForm.reset();
                } else {
                    alert('Failed to submit review: ' + response.statusText);
                }
            } catch (error) {
                console.error('Error submitting review:', error);
                alert('An error occurred. Please try again later.');
            }
        });
    }
}

function checkAuthenticationForAddReview() {
    const token = getCookie('token');
    if (!token) {
        window.location.href = 'index.html';
    }
    return token;
}

async function submitReview(token, placeId, reviewText) {
    return await fetch('https://your-api-url/reviews', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ placeId, reviewText })
    });
}
