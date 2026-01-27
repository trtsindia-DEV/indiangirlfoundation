// Admin Dashboard JavaScript

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadGalleryImages();
    loadDonations();
    setupImagePreview();
    setupFormSubmission();
});

// Authentication check
function checkAuth() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    const loginTime = parseInt(localStorage.getItem('loginTime'));
    const currentTime = Date.now();
    const sessionDuration = 24 * 60 * 60 * 1000; // 24 hours
    
    if (!isLoggedIn || currentTime - loginTime > sessionDuration) {
        logout();
        return;
    }
}

// Logout function
function logout() {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('loginTime');
    window.location.href = 'admin.html';
}

// Tab Management
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active', 'border-orange-600', 'text-orange-600');
        btn.classList.add('text-slate-600');
    });
    
    // Show selected tab
    const selectedTab = document.getElementById(tabName + 'Tab');
    if (selectedTab) {
        selectedTab.classList.remove('hidden');
    }
    
    // Activate selected tab button
    const clickedButton = event.target.closest('.tab-btn');
    if (clickedButton) {
        clickedButton.classList.add('active', 'border-orange-600', 'text-orange-600');
        clickedButton.classList.remove('text-slate-600');
    }
    
    // If switching to gallery tab, reload images and setup form
    if (tabName === 'gallery') {
        setTimeout(() => {
            loadGalleryImages();
            setupImagePreview();
            setupFormSubmission();
        }, 100);
    }
}

// Donations Management
function getDonations() {
    const donations = localStorage.getItem('donations');
    return donations ? JSON.parse(donations) : [];
}

function saveDonations(donations) {
    localStorage.setItem('donations', JSON.stringify(donations));
}

function loadDonations() {
    const donations = getDonations();
    displayDonations(donations);
    updateDonationStats(donations);
}

function displayDonations(donations) {
    const container = document.getElementById('donationsList');
    
    if (donations.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12 text-slate-500">
                <i class="fas fa-heart text-6xl mb-4 opacity-50"></i>
                <p class="text-xl">No donation requests yet</p>
                <p>Donation requests will appear here when users submit them</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = donations.map((donation, index) => `
        <div class="donation-item ${donation.status}" data-status="${donation.status}">
            <div class="bg-slate-50 border-2 border-slate-200 rounded p-6">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="text-xl font-bold">${donation.firstName} ${donation.lastName}</h3>
                        <p class="text-slate-600">ID: ${donation.id}</p>
                        <p class="text-sm text-slate-500">${new Date(donation.submissionDate).toLocaleString()}</p>
                    </div>
                    <div class="text-right">
                        <div class="text-2xl font-bold text-green-600">${donation.amount}</div>
                        <span class="px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(donation.status)}">
                            ${donation.status}
                        </span>
                    </div>
                </div>
                
                <div class="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <p class="text-sm font-bold text-slate-700">Contact Information</p>
                        <p class="text-sm text-slate-600">📧 ${donation.email}</p>
                        <p class="text-sm text-slate-600">📱 ${donation.phone}</p>
                    </div>
                    <div>
                        <p class="text-sm font-bold text-slate-700">Donation Details</p>
                        <p class="text-sm text-slate-600">Type: ${donation.donationType}</p>
                        <p class="text-sm text-slate-600">Area: ${donation.supportArea || 'General Fund'}</p>
                    </div>
                </div>
                
                ${donation.status === 'pending' ? `
                    <div class="flex gap-3">
                        <button onclick="updateDonationStatus(${index}, 'approved')" class="px-4 py-2 bg-green-600 text-white font-bold rounded hover:bg-green-700 transition-colors">
                            <i class="fas fa-check mr-2"></i>
                            Approve (Payment Received)
                        </button>
                        <button onclick="updateDonationStatus(${index}, 'rejected')" class="px-4 py-2 bg-red-600 text-white font-bold rounded hover:bg-red-700 transition-colors">
                            <i class="fas fa-times mr-2"></i>
                            Reject (No Payment)
                        </button>
                    </div>
                ` : `
                    <div class="text-sm text-slate-500">
                        Status updated on: ${donation.statusDate ? new Date(donation.statusDate).toLocaleString() : 'N/A'}
                    </div>
                `}
            </div>
        </div>
    `).join('');
}

function updateDonationStatus(index, status) {
    const donations = getDonations();
    donations[index].status = status;
    donations[index].statusDate = new Date().toISOString();
    donations[index].paymentReceived = status === 'approved';
    
    saveDonations(donations);
    loadDonations();
    
    const statusText = status === 'approved' ? 'approved' : 'rejected';
    showMessage(`Donation ${statusText} successfully!`, 'success');
}

function filterDonations(status) {
    const donations = getDonations();
    const filteredDonations = status === 'all' ? donations : donations.filter(d => d.status === status);
    
    displayDonations(filteredDonations);
    
    // Update active filter button
    document.querySelectorAll('.donation-filter-btn').forEach(btn => {
        btn.classList.remove('active', 'bg-slate-800', 'text-white');
    });
    event.target.classList.add('active', 'bg-slate-800', 'text-white');
}

function updateDonationStats(donations) {
    document.getElementById('totalDonations').textContent = donations.length;
    document.getElementById('pendingDonations').textContent = donations.filter(d => d.status === 'pending').length;
}

function getStatusColor(status) {
    const colors = {
        pending: 'bg-yellow-100 text-yellow-800',
        approved: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
}

// Gallery Images Storage (using PHP backend)
function getGalleryImages() {
    return fetch('get-images.php')
        .then(response => response.json())
        .then(data => data.images || [])
        .catch(error => {
            console.error('Error loading images:', error);
            return [];
        });
}

// Load and display gallery images
async function loadGalleryImages() {
    try {
        const images = await getGalleryImages();
        displayImages(images);
        updateStats(images);
    } catch (error) {
        console.error('Error loading gallery images:', error);
        showMessage('Error loading images', 'error');
    }
}

// Display images in grid
function displayImages(images) {
    const grid = document.getElementById('imagesGrid');
    
    if (images.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-12 text-slate-500">
                <i class="fas fa-images text-6xl mb-4 opacity-50"></i>
                <p class="text-xl">No images in gallery yet</p>
                <p>Add your first image using the form above</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = images.map((image) => `
        <div class="gallery-item ${image.category}" data-category="${image.category}">
            <div class="relative">
                <img src="${image.url}" alt="${image.title}" class="w-full h-64 object-cover mb-4 rounded">
                <button onclick="deleteImage(${image.id})" class="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors">
                    <i class="fas fa-trash text-sm"></i>
                </button>
            </div>
            <h3 class="font-bold text-lg mb-2">${image.title}</h3>
            <p class="text-sm text-slate-600 italic mb-2">"${image.description}"</p>
            <span class="text-xs font-bold uppercase tracking-widest ${getCategoryColor(image.category)}">${getCategoryName(image.category)}</span>
        </div>
    `).join('');
}

// Update statistics
function updateStats(images) {
    document.getElementById('totalImages').textContent = images.length;
    document.getElementById('seniorImages').textContent = images.filter(img => img.category === 'seniors').length;
    document.getElementById('educationImages').textContent = images.filter(img => img.category === 'education').length;
}

// Filter images
async function filterImages(category) {
    try {
        const images = await getGalleryImages();
        const filteredImages = category === 'all' ? images : images.filter(img => img.category === category);
        
        displayImages(filteredImages);
        
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active', 'bg-slate-800', 'text-white'));
        event.target.classList.add('active', 'bg-slate-800', 'text-white');
    } catch (error) {
        console.error('Error filtering images:', error);
        showMessage('Error filtering images', 'error');
    }
}

// Setup image preview
function setupImagePreview() {
    const fileInput = document.getElementById('imageFile');
    const titleInput = document.getElementById('imageTitle');
    const descriptionInput = document.getElementById('imageDescription');
    const categorySelect = document.getElementById('imageCategory');
    const preview = document.getElementById('imagePreview');
    
    if (!fileInput) return; // Elements might not exist in donations tab
    
    function updatePreview() {
        const file = fileInput.files[0];
        const title = titleInput.value || 'Image Title';
        const description = descriptionInput.value || 'Image description will appear here';
        const category = categorySelect.value || 'category';
        
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                preview.innerHTML = `
                    <div class="w-full">
                        <img src="${e.target.result}" alt="Preview" class="w-full h-64 object-cover mb-4 rounded">
                        <h3 class="font-bold text-lg mb-2">${title}</h3>
                        <p class="text-sm text-slate-600 italic mb-2">"${description}"</p>
                        <span class="text-xs font-bold uppercase tracking-widest ${getCategoryColor(category)}">${getCategoryName(category)}</span>
                    </div>
                `;
            };
            reader.readAsDataURL(file);
        }
    }
    
    fileInput.addEventListener('change', updatePreview);
    titleInput.addEventListener('input', updatePreview);
    descriptionInput.addEventListener('input', updatePreview);
    categorySelect.addEventListener('change', updatePreview);
}

// Setup form submission
function setupFormSubmission() {
    const form = document.getElementById('addImageForm');
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const title = document.getElementById('imageTitle').value;
        const description = document.getElementById('imageDescription').value;
        const category = document.getElementById('imageCategory').value;
        const fileInput = document.getElementById('imageFile');
        
        if (!fileInput.files[0]) {
            showMessage('Please select an image file', 'error');
            return;
        }
        
        const file = fileInput.files[0];
        
        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            showMessage('File size must be less than 5MB', 'error');
            return;
        }
        
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('image', file);
        formData.append('title', title);
        formData.append('description', description);
        formData.append('category', category);
        
        try {
            // Show loading message
            showMessage('Uploading image...', 'info');
            
            const response = await fetch('upload-image.php', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Update display
                await loadGalleryImages();
                
                // Reset form
                form.reset();
                document.getElementById('imagePreview').innerHTML = `
                    <div class="text-center text-slate-400">
                        <i class="fas fa-image text-4xl mb-4"></i>
                        <p>Image preview will appear here</p>
                    </div>
                `;
                
                showMessage('Image uploaded successfully!', 'success');
            } else {
                showMessage(result.error || 'Upload failed', 'error');
            }
        } catch (error) {
            console.error('Upload error:', error);
            showMessage('Upload failed. Please try again.', 'error');
        }
    });
}

// Delete image
async function deleteImage(imageId) {
    if (confirm('Are you sure you want to delete this image?')) {
        try {
            const response = await fetch('delete-image.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: imageId })
            });
            
            const result = await response.json();
            
            if (result.success) {
                await loadGalleryImages();
                showMessage('Image deleted successfully', 'success');
            } else {
                showMessage(result.error || 'Delete failed', 'error');
            }
        } catch (error) {
            console.error('Delete error:', error);
            showMessage('Delete failed. Please try again.', 'error');
        }
    }
}

// Utility functions
function getCategoryColor(category) {
    const colors = {
        seniors: 'text-orange-600',
        education: 'text-blue-600',
        environment: 'text-green-600',
        community: 'text-purple-600'
    };
    return colors[category] || 'text-slate-600';
}

function getCategoryName(category) {
    const names = {
        seniors: 'Senior Care',
        education: 'Education',
        environment: 'Environment',
        community: 'Community'
    };
    return names[category] || category;
}

// Show success/error messages
function showMessage(message, type) {
    const container = document.getElementById('messageContainer');
    const messageDiv = document.createElement('div');
    
    let bgColor, icon;
    switch(type) {
        case 'success':
            bgColor = 'bg-green-50 border-green-600 text-green-800';
            icon = 'fa-check-circle';
            break;
        case 'error':
            bgColor = 'bg-red-50 border-red-600 text-red-800';
            icon = 'fa-exclamation-triangle';
            break;
        case 'info':
            bgColor = 'bg-blue-50 border-blue-600 text-blue-800';
            icon = 'fa-info-circle';
            break;
        default:
            bgColor = 'bg-gray-50 border-gray-600 text-gray-800';
            icon = 'fa-info-circle';
    }
    
    messageDiv.className = `p-4 border-l-4 ${bgColor} mb-4 rounded shadow-lg`;
    messageDiv.innerHTML = `
        <div class="flex items-center">
            <i class="fas ${icon} mr-3"></i>
            <span>${message}</span>
        </div>
    `;
    
    container.appendChild(messageDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}