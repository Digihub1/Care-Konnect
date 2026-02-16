// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
}

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// Dropdown functionality
document.addEventListener('DOMContentLoaded', function() {
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            const dropdownMenu = this.nextElementSibling;
            dropdownMenu.classList.toggle('show');
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.matches('.dropdown-toggle')) {
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                menu.classList.remove('show');
            });
        }
    });
});

// Form validation and submission
function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return true;

    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('error');
            isValid = false;
        } else {
            input.classList.remove('error');
        }

        // Email validation
        if (input.type === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.value)) {
                input.classList.add('error');
                isValid = false;
            }
        }

        // Phone validation
        if (input.type === 'tel' || input.name === 'phone') {
            const phoneRegex = /^[+]?[0-9\s\-\(\)]{10,}$/;
            if (!phoneRegex.test(input.value)) {
                input.classList.add('error');
                isValid = false;
            }
        }
    });

    return isValid;
}

// Toast notification system
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

// Booking system functionality
class BookingSystem {
    constructor() {
        this.initializeBookingButtons();
    }

    initializeBookingButtons() {
        document.querySelectorAll('.book-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const caregiverId = e.target.dataset.caregiverId;
                const caregiverName = e.target.dataset.caregiverName;
                this.openBookingModal(caregiverId, caregiverName);
            });
        });
    }

    openBookingModal(caregiverId, caregiverName) {
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h3>Book ${caregiverName}</h3>
                <form id="bookingForm">
                    <input type="hidden" name="caregiverId" value="${caregiverId}">
                    
                    <div class="form-group">
                        <label for="serviceType">Service Type</label>
                        <select id="serviceType" name="serviceType" required>
                            <option value="">Select Service</option>
                            <option value="elderly-care">Elderly Care</option>
                            <option value="child-care">Child Care</option>
                            <option value="disability-care">Disability Care</option>
                            <option value="medical-care">Medical Care</option>
                            <option value="companion-care">Companion Care</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="startDate">Start Date</label>
                        <input type="date" id="startDate" name="startDate" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="duration">Duration (hours)</label>
                        <input type="number" id="duration" name="duration" min="1" max="24" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="notes">Additional Notes</label>
                        <textarea id="notes" name="notes" rows="3"></textarea>
                    </div>
                    
                    <button type="submit" class="btn btn-primary">Submit Booking</button>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Close modal functionality
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
        });

        // Handle form submission
        modal.querySelector('#bookingForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitBooking(e.target);
        });
    }

    async submitBooking(form) {
        const formData = new FormData(form);
        const bookingData = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bookingData)
            });

            const result = await response.json();

            if (response.ok) {
                showToast('Booking request submitted successfully!', 'success');
                document.querySelector('.modal').remove();
            } else {
                showToast(result.error || 'Booking failed. Please try again.', 'error');
            }
        } catch (error) {
            showToast('Network error. Please check your connection.', 'error');
        }
    }
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize booking system
    if (document.querySelector('.book-btn')) {
        new BookingSystem();
    }

    // Add CSS for toast notifications
    const toastStyles = `
        .toast {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            font-weight: 500;
            display: flex;
            justify-content: space-between;
            align-items: center;
            min-width: 300px;
            transform: translateX(400px);
            transition: transform 0.3s ease;
            z-index: 1000;
        }
        
        .toast.show {
            transform: translateX(0);
        }
        
        .toast-success {
            background-color: #4CAF50;
        }
        
        .toast-error {
            background-color: #f44336;
        }
        
        .toast button {
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            padding: 0 0 0 10px;
        }
        
        .modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }
        
        .modal-content {
            background: white;
            padding: 30px;
            border-radius: 10px;
            min-width: 400px;
            position: relative;
        }
        
        .close-modal {
            position: absolute;
            top: 15px;
            right: 20px;
            font-size: 24px;
            cursor: pointer;
        }
        
        .error {
            border-color: #f44336 !important;
        }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = toastStyles;
    document.head.appendChild(styleSheet);
});